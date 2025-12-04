// 멀티 세션 관리 API (v2) - 개선 버전
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');
    
    try {
        let sessions = await env.KV.get("sessions_v2", { type: "json" });
        
        // KV에 데이터가 없으면 빈 배열로 초기화
        if (!sessions || !Array.isArray(sessions)) {
            sessions = [];
        }
        
        if (sessionId) {
            const session = sessions.find(s => s.id === sessionId);
            return new Response(JSON.stringify({
                success: true,
                session: session || null
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        // 활성 세션만 반환
        const activeSessions = sessions.filter(s => s.status === 'active');
        
        return new Response(JSON.stringify({
            success: true,
            sessions: activeSessions,
            totalActive: activeSessions.length
        }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}

export async function onRequestPost(context) {
    const { env, request } = context;
    
    try {
        const body = await request.json();
        const { action, session, sessionId, order } = body;
        
        // 현재 세션 목록 가져오기
        let sessions = await env.KV.get("sessions_v2", { type: "json" });
        if (!sessions || !Array.isArray(sessions)) {
            sessions = [];
        }
        
        // ===== 세션 시작 =====
        if (action === "start") {
            // 동일 대상에 대해 활성 세션이 있는지 확인
            const existingSession = sessions.find(s => 
                s.status === 'active' && s.target === session.target
            );
            
            if (existingSession) {
                return new Response(JSON.stringify({
                    success: false,
                    error: `이미 "${session.target === 'all' ? '전사' : session.target}" 대상으로 진행 중인 세션이 있습니다. 기존 세션을 종료하고 시작해주세요.`,
                    existingSession: existingSession
                }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            // 새 세션 생성
            const newSession = {
                id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                cafe: session.cafe,
                target: session.target,
                status: 'active',
                orders: [],
                createdAt: new Date().toISOString()
            };
            
            sessions.push(newSession);
            await env.KV.put("sessions_v2", JSON.stringify(sessions));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Session started",
                session: newSession,
                totalActive: sessions.filter(s => s.status === 'active').length
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        // ===== 세션 종료 =====
        if (action === "end") {
            if (!sessionId) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "sessionId is required"
                }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            const sessionIndex = sessions.findIndex(s => s.id === sessionId);
            
            if (sessionIndex === -1) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Session not found"
                }), {
                    status: 404,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            sessions[sessionIndex].status = 'ended';
            sessions[sessionIndex].endedAt = new Date().toISOString();
            
            await env.KV.put("sessions_v2", JSON.stringify(sessions));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Session ended",
                totalActive: sessions.filter(s => s.status === 'active').length
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        // ===== 주문 추가 =====
        if (action === "addOrder") {
            if (!sessionId || !order) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "sessionId and order are required"
                }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            const sessionIndex = sessions.findIndex(s => s.id === sessionId);
            
            if (sessionIndex === -1) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Session not found"
                }), {
                    status: 404,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            if (sessions[sessionIndex].status !== 'active') {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Session is not active"
                }), {
                    status: 400,
                    headers: { 
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    }
                });
            }
            
            // orders 배열 초기화 확인
            if (!sessions[sessionIndex].orders) {
                sessions[sessionIndex].orders = [];
            }
            
            // 기존 주문 제거 (같은 사람이 다시 주문하는 경우)
            sessions[sessionIndex].orders = sessions[sessionIndex].orders.filter(
                o => o.member !== order.member
            );
            sessions[sessionIndex].orders.push(order);
            
            await env.KV.put("sessions_v2", JSON.stringify(sessions));
            
            // 주문 이력 저장 (추천 시스템용)
            try {
                await saveOrderHistory(env, order);
            } catch (historyError) {
                console.error('History save error:', historyError);
                // 이력 저장 실패해도 주문은 성공으로 처리
            }
            
            return new Response(JSON.stringify({
                success: true,
                message: "Order added",
                orders: sessions[sessionIndex].orders,
                orderCount: sessions[sessionIndex].orders.length
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        return new Response(JSON.stringify({
            success: false,
            error: "Invalid action: " + action
        }), {
            status: 400,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
        
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
}

// 주문 이력 저장 함수
async function saveOrderHistory(env, order) {
    if (!order || !order.member) return;
    
    const historyKey = `history_${order.member.replace(/\s/g, '_')}`;
    let history = await env.KV.get(historyKey, { type: "json" });
    
    if (!history || !Array.isArray(history)) {
        history = [];
    }
    
    // 동일 메뉴 주문 횟수 증가 또는 새로 추가
    const existingIndex = history.findIndex(h => 
        h.menu === order.menu && h.cafe === order.cafe
    );
    
    if (existingIndex !== -1) {
        history[existingIndex].count = (history[existingIndex].count || 1) + 1;
        history[existingIndex].lastOrdered = order.timestamp;
    } else {
        history.push({
            menu: order.menu,
            cafe: order.cafe,
            temp: order.temp,
            size: order.size,
            count: 1,
            lastOrdered: order.timestamp
        });
    }
    
    await env.KV.put(historyKey, JSON.stringify(history));
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
