// 세션 관리 API
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const session = await env.KV.get("current_session", { type: "json" });
        
        return new Response(JSON.stringify({
            success: true,
            session: session
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
        const { action, session } = body;
        
        if (action === "start") {
            await env.KV.put("current_session", JSON.stringify(session));
            // 새 세션 시작 시 주문 초기화
            await env.KV.put("orders", JSON.stringify([]));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Session started"
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } else if (action === "end") {
            await env.KV.delete("current_session");
            
            return new Response(JSON.stringify({
                success: true,
                message: "Session ended"
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}

