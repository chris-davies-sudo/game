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

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await axios.get("http://localhost:8080/api/v1/game/profile/beautiful");
                setPoints(response.data.points);
                const categoriesResponse = await axios.get("http://localhost:8080/api/v1/game/categories");
                setSegments(categoriesResponse.data.data.map(cat => ({ option: cat.name })));
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
            setPoints(prev => prev - mainPowerups.find(p => p._id === powerupId).cost);
        } catch (error) {
            console.error("Error purchasing power-up:", error);
        }
    };

    const handleSpinClick = () => {
        if (segments.length === 0) return;
        const newPrizeNumber = Math.floor(Math.random() * segments.length);
        setPrizeNumber(newPrizeNumber);
        setMustSpin(true);
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
            <div className="flex-1 flex flex-col justify-center items-center bg-red-500 text-black scale-[1.2]">
                <Wheel
                    mustStartSpinning={mustSpin}
                    prizeNumber={prizeNumber}
                    data={segments.length > 0 ? segments : [{ option: "Loading..." }]}
                    onStopSpinning={() => {
                        setMustSpin(false);
                        console.log("Landed on:", segments[prizeNumber]?.option || "Unknown");
                    }}
                    backgroundColors={["#EE4040", "#F0CF50", "#815CD1", "#3DA5E0", "#34A24F", "#F9AA1F", "#EC3F3F", "#FF9000"]}
                    textColors={["#FFFFFF"]}
                    fontSize="14"
                />
                <button 
                    onClick={handleSpinClick} 
                    disabled={mustSpin} 
                    className={`px-6 py-3 rounded-lg font-bold shadow-lg transition 
                                ${mustSpin ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-700"}`}>
                    {mustSpin ? "Spinning..." : "Spin"}
                </button>
            </div>

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
                                                <button className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg" onClick={() => purchasePowerup(powerup._id)}>Purchase</button>
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
