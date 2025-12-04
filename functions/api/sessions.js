// 멀티 세션 관리 API (v2)
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');
    
    try {
        const sessions = await env.KV.get("sessions_v2", { type: "json" }) || [];
        
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
            sessions: activeSessions
        }), {
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
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
        const { action, session, sessionId } = body;
        
        let sessions = await env.KV.get("sessions_v2", { type: "json" }) || [];
        
        if (action === "start") {
            // 동일 대상에 대해 활성 세션이 있는지 확인
            const existingSession = sessions.find(s => 
                s.status === 'active' && s.target === session.target
            );
            
            if (existingSession) {
                return new Response(JSON.stringify({
                    success: false,
                    error: `이미 "${session.target === 'all' ? '전사' : session.target}" 대상으로 진행 중인 세션이 있습니다.`,
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
                id: `session_${Date.now()}`,
                ...session,
                status: 'active',
                orders: [],
                createdAt: new Date().toISOString()
            };
            
            sessions.push(newSession);
            await env.KV.put("sessions_v2", JSON.stringify(sessions));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Session started",
                session: newSession
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
            
        } else if (action === "end") {
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
                message: "Session ended"
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
            
        } else if (action === "addOrder") {
            const { order } = body;
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
            
            // 기존 주문 제거 (같은 사람이 다시 주문하는 경우)
            sessions[sessionIndex].orders = sessions[sessionIndex].orders.filter(
                o => o.member !== order.member
            );
            sessions[sessionIndex].orders.push(order);
            
            await env.KV.put("sessions_v2", JSON.stringify(sessions));
            
            // 주문 이력 저장 (추천 시스템용)
            await saveOrderHistory(env, order);
            
            return new Response(JSON.stringify({
                success: true,
                message: "Order added",
                orders: sessions[sessionIndex].orders
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        }
        
        return new Response(JSON.stringify({
            success: false,
            error: "Invalid action"
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
            error: error.message
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
    const historyKey = `history_${order.member.replace(/\s/g, '_')}`;
    let history = await env.KV.get(historyKey, { type: "json" }) || [];
    
    // 동일 메뉴 주문 횟수 증가 또는 새로 추가
    const existingIndex = history.findIndex(h => 
        h.menu === order.menu && h.cafe === order.cafe
    );
    
    if (existingIndex !== -1) {
        history[existingIndex].count++;
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

