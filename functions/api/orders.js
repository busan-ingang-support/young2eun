// 주문 관리 API
export async function onRequestGet(context) {
    const { env } = context;
    
    try {
        const orders = await env.KV.get("orders", { type: "json" }) || [];
        
        return new Response(JSON.stringify({
            success: true,
            orders: orders
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
        const { action, order } = body;
        
        // 현재 주문 목록 가져오기
        let orders = await env.KV.get("orders", { type: "json" }) || [];
        
        if (action === "add") {
            // 기존 주문이 있으면 제거 (같은 사람이 다시 주문하는 경우)
            orders = orders.filter(o => o.member !== order.member);
            orders.push(order);
            
            await env.KV.put("orders", JSON.stringify(orders));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Order added",
                orders: orders
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } else if (action === "remove") {
            orders = orders.filter(o => o.member !== order.member);
            
            await env.KV.put("orders", JSON.stringify(orders));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Order removed",
                orders: orders
            }), {
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            });
        } else if (action === "clear") {
            await env.KV.put("orders", JSON.stringify([]));
            
            return new Response(JSON.stringify({
                success: true,
                message: "Orders cleared",
                orders: []
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

