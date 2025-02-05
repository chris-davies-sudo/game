import axios from "axios";
import { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { FaStore, FaTimes, FaArrowLeft } from "react-icons/fa";

export default function HomePage() {
    const [points, setPoints] = useState(0);
    const [shopOpen, setShopOpen] = useState(false);
    const [mainPowerups, setMainPowerups] = useState([]);
    const [subPowerups, setSubPowerups] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [mustSpin, setMustSpin] = useState(false);
    const [prizeNumber, setPrizeNumber] = useState(0);
    const [segments, setSegments] = useState([]);
    const [prizeInfo, setPrizeInfo] = useState(null);
    const [spinCount, setSpinCount] = useState(0);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/game/profile/beautiful");
                setPoints(response.data.points);
                
                const categoriesResponse = await axios.get("http://localhost:8080/api/v1/game/categories");
    
                // Map segments with alternating black and red, and green for presents
                const mappedSegments = categoriesResponse.data.data.map((cat, index) => ({
                    id: cat._id,
                    option: cat.name,
                    category: cat.category,
                    type: cat.type,
                    description: cat.description,
                    point_reward: cat.point_reward,
                    usage: cat.usage,
                    style: { 
                        backgroundColor: cat.category === "present" ? "#2B7216" : index % 2 === 0 ? "#000000" : "#9E0602", 
                        textColor: "#FFFFFF" 
                    }
                }));
    
                setSegments(mappedSegments);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
        fetchUserData();
    }, []);

    const openShop = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/v1/game/powerups/main");
            setMainPowerups(response.data.data);
            setShopOpen(true);
        } catch (error) {
            console.error("Error fetching main power-ups:", error);
        }
    };

    const loadSubPowerups = async (type) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/v1/game/powerups/sub/${type}`);
            setSubPowerups(response.data.data);
            setSelectedCategory(type);
        } catch (error) {
            console.error("Error fetching sub power-ups:", error);
        }
    };

    const purchasePowerup = async (powerupId) => {
        try {
            await axios.post(`http://localhost:8080/api/v1/game/purchase-powerup?username=beautiful&powerup_id=${powerupId}`);
            
            // Update points locally
            const purchasedPowerup = subPowerups.find(p => p._id === powerupId);
            setPoints(prev => prev - purchasedPowerup.cost);
    
            // Remove the purchased power-up from the list
            setSubPowerups(prev => prev.map(p => 
                p._id === powerupId ? { ...p, taken: true } : p
            ));
            logUserEvent("powerup_purchase", powerupId);
        } catch (error) {
            console.error("Error purchasing power-up:", error);
        }
    };

    const logUserEvent = async (eventType, powerupId = null, categoryId = null, pointsEarned = 0) => {
        try {
            const params = new URLSearchParams();
            params.append("username", "beautiful");
            params.append("event_type", eventType);
            if (powerupId) params.append("powerup_id", powerupId);
            if (categoryId) params.append("category_id", categoryId);
            if (pointsEarned) params.append("points_earned", pointsEarned);

            await axios.post(`http://localhost:8080/api/v1/game/user-events?${params.toString()}`, {}, {
                headers: {
                    'x-tenant': 'e1d62053-5cd0-494d-a747-dcb5670be1c1',
                    'authorization': 'bearer '
                }
            });
        } catch (error) {
            console.error("Error logging user event:", error);
        }
    };

    const handleSpinClick = () => {
        if (segments.length === 0 || mustSpin) return; // Prevent clicking multiple times
    
        setSpinCount(prevSpinCount => {
            const updatedSpinCount = prevSpinCount + 1;
            let newPrizeNumber;
    
            if (updatedSpinCount % 12 === 0) { // Ensure every 6th spin lands on a "present"
                const presentSegments = segments.filter(seg => seg.category === "present");
                if (presentSegments.length > 0) {
                    const selectedPresent = presentSegments[Math.floor(Math.random() * presentSegments.length)];
                    newPrizeNumber = segments.findIndex(seg => seg.id === selectedPresent.id);
                } else {
                    newPrizeNumber = Math.floor(Math.random() * segments.length); // Fallback if no presents exist
                }
            } else {
                newPrizeNumber = Math.floor(Math.random() * segments.length);
            }
    
            setPrizeNumber(newPrizeNumber);
            setMustSpin(true);
            return updatedSpinCount; // Correctly increments the spin count
        });
    };

    const handleSpinEnd = () => {
        setMustSpin(false);
        setSegments(prevSegments => {
            return prevSegments.map((seg, index) => {
                if (index === prizeNumber) {
                    let newUsage = seg.usage - 1;
                    if (newUsage <= 0) {
                        return {
                            ...seg,
                            usage: 0,
                            option: "Turn the tables",
                            description: "You get to give the game master a task, if he passes -50 points for you.",
                            style: { backgroundColor: "#D4AF37", textColor: "#FFFFFF" },
                            point_reward: '-50',
                            category: 'game'
                        };
                    }
                    return { ...seg, usage: newUsage };
                }
                return seg;
            });
        });

        const selectedPrize = segments[prizeNumber];
        setPrizeInfo(selectedPrize);
        logUserEvent("spin", null, selectedPrize.id, selectedPrize.point_reward);
    };

    return (
        <div className="fixed inset-0 flex overflow-hidden">
            {/* Left Side - Black Background */}
            <div className="flex-1 flex flex-col justify-center items-center bg-black text-white">
                <h1 className="text-7xl font-bold">LOVE & LUST</h1>
                <h2 className="text-5xl font-bold">THE GAME</h2>
                <div className="text-2xl pt-5">Points: {points}</div>
                <FaStore className="text-6xl cursor-pointer hover:text-gray-400 pt-5" onClick={openShop} />
            </div>

            {/* Right Side - Red Background */}
            <div className="flex-1 flex flex-col justify-center items-center bg-[#DC143C] text-black scale-[1.2]">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={segments.length > 0 ? segments : [{ option: "Loading..." }]}
                    onStopSpinning={handleSpinEnd}
                    backgroundColors={segments.map(seg => seg.style.backgroundColor)}
                    textColors={segments.map(() => "#FFFFFF")}
                    fontSize={12}
                    outerBorderColor="#000000"
                    outerBorderWidth={20}
                    innerRadius={20} // Adjusted to resemble a roulette wheel
                    innerBorderColor="#000000"
                    innerBorderWidth={5}
                    radiusLineColor="#D4AF37"
                    radiusLineWidth={2}
                    perpendicularText={false} // Ensures text aligns better with the segments
                    textDistance={60}
                />
                <button 
                    onClick={handleSpinClick} 
                    disabled={mustSpin} 
                    className={`px-6 py-3 rounded-lg font-bold shadow-lg transition bg-black text-white
                                ${mustSpin ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-700 hover:border-[#D4AF37]"}`}>
                    {mustSpin ? "Spinning..." : "Spin"}
                </button>
                
            </div>

            {/* Prize Overlay */}
            {prizeInfo && (
                <div className="fixed inset-0 flex justify-center items-center p-10">
                    <div className={`bg-white rounded-lg p-6 w-2/3 max-w-3xl h-auto flex flex-col relative border-4 ${prizeInfo.type === "love" || prizeInfo.type === "lust" ? `border-[${prizeInfo.style.backgroundColor}]` : "border-transparent"}`}>
                        <button className="absolute top-4 right-4 text-black text-2xl" onClick={() => setPrizeInfo(null)}>
                            <FaTimes />
                        </button>
                        <h2 className="text-3xl font-bold">{prizeInfo.option}</h2>
                        <p className="mt-4 text-lg">{prizeInfo.description}</p>
                        <p className="mt-2 font-semibold">Points Reward: {prizeInfo.point_reward}</p>
                    </div>
                </div>
            )}

            {/* Shop Overlay */}
            {shopOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-10">
                    <div className="bg-white rounded-lg p-6 w-2/3 max-w-3xl h-4/5 flex flex-col relative overflow-hidden">
                        <div className="flex justify-between items-center mb-4 px-4">
                            <h2 className="text-3xl font-bold">Power-Ups</h2>
                            <button className="text-black text-2xl" onClick={() => setShopOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {!selectedCategory ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {mainPowerups.map(powerup => (
                                        <button key={powerup._id} className="p-4 bg-gray-200 rounded-lg text-black font-semibold" onClick={() => loadSubPowerups(powerup.type)}>
                                            {powerup.name}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-4 px-4">
                                        <FaArrowLeft className="text-2xl text-gray-400 cursor-pointer hover:text-blue-500" onClick={() => setSelectedCategory(null)} />
                                        <h3 className="text-xl font-semibold">Points: {points}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {subPowerups.map(powerup => (
                                            <div key={powerup._id} className="p-4 bg-gray-200 rounded-lg text-black font-semibold">
                                                <h3>{powerup.name}</h3>
                                                <p>{powerup.description}</p>
                                                <p>Cost: {powerup.cost} points</p>
                                                {powerup.taken ? (
                                                        <button className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg cursor-not-allowed" disabled>
                                                            Taken
                                                        </button>
                                                    ) : (
                                                        <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg" onClick={() => purchasePowerup(powerup._id, powerup.type)}>
                                                            Purchase
                                                        </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
