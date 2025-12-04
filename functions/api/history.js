// 주문 이력 및 메뉴 추천 API (v2)

// 카페간 유사 메뉴 매핑 테이블
const menuSimilarity = {
    // 초콜릿 계열
    "chocolate": [
        { cafe: "smoothien", menus: ["초코라떼", "카페모카", "초코쉐이크", "모카쉐이크"] },
        { cafe: "starbucks", menus: ["자바칩 프라푸치노", "카페 모카", "화이트 초콜릿 모카", "초콜릿"] },
        { cafe: "twosome", menus: ["초코 라떼", "카페모카"] },
        { cafe: "ediya", menus: ["초코라떼", "카페모카"] },
        { cafe: "mega", menus: ["초코라떼", "카페모카"] },
        { cafe: "baekdabang", menus: ["초코라떼"] },
        { cafe: "compose", menus: ["초코라떼", "카페모카"] },
        { cafe: "hollys", menus: ["초코라떼", "카페모카"] },
        { cafe: "angelinus", menus: ["초코라떼", "카페모카"] }
    ],
    // 바닐라 계열
    "vanilla": [
        { cafe: "smoothien", menus: ["바닐라라떼"] },
        { cafe: "starbucks", menus: ["바닐라 라떼", "바닐라 크림 콜드 브루", "바닐라 크림 프라푸치노"] },
        { cafe: "twosome", menus: ["바닐라 빈 라떼"] },
        { cafe: "ediya", menus: ["바닐라라떼"] },
        { cafe: "mega", menus: ["바닐라라떼"] },
        { cafe: "baekdabang", menus: ["바닐라라떼"] },
        { cafe: "compose", menus: ["바닐라라떼"] },
        { cafe: "hollys", menus: ["바닐라라떼"] },
        { cafe: "angelinus", menus: ["바닐라라떼"] }
    ],
    // 카라멜 계열
    "caramel": [
        { cafe: "smoothien", menus: ["카라멜마끼아또", "돌체라떼"] },
        { cafe: "starbucks", menus: ["카라멜 마키아또", "카라멜 프라푸치노", "돌체 라떼"] },
        { cafe: "twosome", menus: ["카라멜 마끼아또", "돌체라떼"] },
        { cafe: "ediya", menus: ["카라멜 마끼아또", "돌체라떼"] },
        { cafe: "mega", menus: ["카라멜마끼아또"] },
        { cafe: "baekdabang", menus: ["카라멜마끼아또", "흑당라떼"] },
        { cafe: "compose", menus: ["카라멜마끼아또"] },
        { cafe: "hollys", menus: ["카라멜마끼아또"] },
        { cafe: "angelinus", menus: ["카라멜마끼아또"] }
    ],
    // 녹차/말차 계열
    "greentea": [
        { cafe: "smoothien", menus: ["녹차", "녹차라떼", "그린티스무디"] },
        { cafe: "starbucks", menus: ["말차 라떼", "녹차 프라푸치노"] },
        { cafe: "twosome", menus: ["녹차 라떼"] },
        { cafe: "ediya", menus: ["녹차 빙수라떼"] },
        { cafe: "mega", menus: ["녹차라떼"] },
        { cafe: "baekdabang", menus: ["녹차라떼"] },
        { cafe: "compose", menus: ["녹차라떼"] },
        { cafe: "hollys", menus: ["녹차라떼"] },
        { cafe: "angelinus", menus: ["녹차라떼"] }
    ],
    // 딸기 계열
    "strawberry": [
        { cafe: "smoothien", menus: ["딸기스무디", "딸기주스", "딸기바나나주스", "딸기레몬스무디", "딸기블루베리스무디"] },
        { cafe: "starbucks", menus: ["딸기 딜라이트 요거트"] },
        { cafe: "twosome", menus: ["리얼 딸기 라떼", "딸기 스무디"] },
        { cafe: "ediya", menus: ["딸기라떼", "딸기스무디"] },
        { cafe: "mega", menus: ["딸기라떼"] },
        { cafe: "baekdabang", menus: ["딸기라떼", "딸기스무디"] },
        { cafe: "compose", menus: ["딸기라떼"] },
        { cafe: "hollys", menus: ["딸기스무디"] },
        { cafe: "angelinus", menus: ["딸기라떼"] }
    ],
    // 레몬에이드 계열
    "lemonade": [
        { cafe: "smoothien", menus: ["레몬에이드", "레몬차"] },
        { cafe: "starbucks", menus: ["아이스 유자 민트티"] },
        { cafe: "twosome", menus: ["레몬 에이드"] },
        { cafe: "ediya", menus: ["레몬에이드"] },
        { cafe: "mega", menus: ["레몬에이드"] },
        { cafe: "baekdabang", menus: ["레몬에이드"] },
        { cafe: "compose", menus: ["레몬에이드"] },
        { cafe: "hollys", menus: ["레몬에이드"] },
        { cafe: "angelinus", menus: ["레몬에이드"] }
    ],
    // 자몽에이드 계열
    "grapefruit": [
        { cafe: "smoothien", menus: ["자몽에이드"] },
        { cafe: "starbucks", menus: ["아이스 자몽 허니 블랙티"] },
        { cafe: "twosome", menus: ["자몽 에이드"] },
        { cafe: "ediya", menus: ["자몽에이드"] },
        { cafe: "mega", menus: ["자몽에이드"] },
        { cafe: "baekdabang", menus: ["자몽에이드"] },
        { cafe: "compose", menus: ["자몽에이드"] },
        { cafe: "hollys", menus: ["자몽에이드"] },
        { cafe: "angelinus", menus: ["자몽에이드"] }
    ],
    // 고구마 계열
    "sweetpotato": [
        { cafe: "smoothien", menus: ["고구마라떼"] },
        { cafe: "mega", menus: ["고구마라떼"] },
        { cafe: "baekdabang", menus: ["고구마라떼"] },
        { cafe: "compose", menus: ["고구마라떼"] },
        { cafe: "hollys", menus: ["고구마라떼"] },
        { cafe: "angelinus", menus: ["고구마라떼"] }
    ],
    // 밀크티 계열
    "milktea": [
        { cafe: "smoothien", menus: ["밀크티"] },
        { cafe: "twosome", menus: ["밀크티 라떼"] },
        { cafe: "baekdabang", menus: ["밀크티"] },
        { cafe: "compose", menus: ["밀크티"] },
        { cafe: "hollys", menus: ["밀크티라떼"] }
    ],
    // 망고 계열
    "mango": [
        { cafe: "smoothien", menus: ["망고스무디"] },
        { cafe: "twosome", menus: ["망고 스무디"] },
        { cafe: "ediya", menus: ["망고스무디"] },
        { cafe: "mega", menus: ["망고스무디", "애플망고에이드"] },
        { cafe: "baekdabang", menus: ["망고스무디"] },
        { cafe: "hollys", menus: ["망고스무디"] }
    ],
    // 콜드브루 계열
    "coldbrew": [
        { cafe: "starbucks", menus: ["콜드 브루", "나이트로 콜드 브루", "바닐라 크림 콜드 브루"] },
        { cafe: "twosome", menus: ["콜드브루 아메리카노", "콜드브루 라떼"] },
        { cafe: "ediya", menus: ["콜드브루", "콜드브루 라떼"] },
        { cafe: "mega", menus: ["콜드브루 아메리카노", "콜드브루 라떼"] },
        { cafe: "compose", menus: ["콜드브루"] },
        { cafe: "hollys", menus: ["콜드브루"] },
        { cafe: "angelinus", menus: ["콜드브루"] }
    ],
    // 연유라떼 계열
    "condensedmilk": [
        { cafe: "ediya", menus: ["연유라떼"] },
        { cafe: "mega", menus: ["연유라떼"] },
        { cafe: "baekdabang", menus: ["연유라떼"] },
        { cafe: "compose", menus: ["연유라떼"] }
    ],
    // 헤이즐넛 계열
    "hazelnut": [
        { cafe: "smoothien", menus: ["헤이즐넛라떼"] },
        { cafe: "twosome", menus: ["헤이즐넛 라떼"] },
        { cafe: "mega", menus: ["헤이즐넛라떼"] },
        { cafe: "compose", menus: ["헤이즐넛라떼"] },
        { cafe: "angelinus", menus: ["헤이즐넛라떼"] }
    ]
};

// 메뉴가 속한 카테고리 찾기
function findMenuCategory(menu, cafe) {
    for (const [category, cafes] of Object.entries(menuSimilarity)) {
        const cafeData = cafes.find(c => c.cafe === cafe);
        if (cafeData && cafeData.menus.some(m => 
            m.toLowerCase().replace(/\s/g, '') === menu.toLowerCase().replace(/\s/g, '')
        )) {
            return category;
        }
    }
    return null;
}

// 특정 카페에서 유사 메뉴 찾기
function findSimilarMenusInCafe(category, targetCafe) {
    if (!category) return [];
    
    const categoryData = menuSimilarity[category];
    if (!categoryData) return [];
    
    const cafeData = categoryData.find(c => c.cafe === targetCafe);
    return cafeData ? cafeData.menus : [];
}

export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const member = url.searchParams.get('member');
    const targetCafe = url.searchParams.get('cafe');
    
    if (!member) {
        return new Response(JSON.stringify({
            success: false,
            error: "Member name is required"
        }), {
            status: 400,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });
    }
    
    try {
        const historyKey = `history_${member.replace(/\s/g, '_')}`;
        const history = await env.KV.get(historyKey, { type: "json" }) || [];
        
        // 2회 이상 주문한 메뉴만 필터링
        const frequentOrders = history.filter(h => h.count >= 2);
        
        // 추천 메뉴 생성
        let recommendations = [];
        
        if (targetCafe) {
            // 특정 카페에 대한 추천
            frequentOrders.forEach(order => {
                const category = findMenuCategory(order.menu, order.cafe);
                
                if (order.cafe === targetCafe) {
                    // 같은 카페에서 자주 시킨 메뉴
                    recommendations.push({
                        menu: order.menu,
                        reason: `${order.count}회 주문한 메뉴`,
                        type: 'favorite',
                        count: order.count
                    });
                } else if (category) {
                    // 다른 카페에서 비슷한 메뉴
                    const similarMenus = findSimilarMenusInCafe(category, targetCafe);
                    similarMenus.forEach(menu => {
                        if (!recommendations.find(r => r.menu === menu)) {
                            recommendations.push({
                                menu: menu,
                                reason: `${order.cafe}에서 ${order.menu}를 좋아하셨네요!`,
                                type: 'similar',
                                basedOn: { cafe: order.cafe, menu: order.menu, count: order.count }
                            });
                        }
                    });
                }
            });
        }
        
        // 추천 메뉴 정렬 (favorite 먼저, 그 다음 similar)
        recommendations.sort((a, b) => {
            if (a.type === 'favorite' && b.type !== 'favorite') return -1;
            if (a.type !== 'favorite' && b.type === 'favorite') return 1;
            return (b.count || b.basedOn?.count || 0) - (a.count || a.basedOn?.count || 0);
        });
        
        return new Response(JSON.stringify({
            success: true,
            history: history,
            recommendations: recommendations.slice(0, 5) // 최대 5개 추천
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

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}

