import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("https://game-868591301492.europe-west2.run.app/api/v1/auth/login", {
                username,
                password
            });

            localStorage.setItem("token", response.data.access_token);
            navigate("/home");
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className=" flex justify-center items-center h-screen w-screen fixed inset-0 overflow-hidden bg-black">
            {/* Random Gold Question Marks */}
            <div >
                {Array.from({ length: 30 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute text-[#D4AF37] text-7xl font-bold "
                        style={{
                            top: `${Math.random() * 150}vh`,
                            left: `${Math.random() * 150}vw`,
                            transform: `rotate(${Math.random() * 360}deg)`,
                        }}
                    >
                        ?
                    </div>
                ))}
            </div>

            {/* Login Box */}
            <div className="relative bg-black p-8 rounded-lg shadow-lg w-96 z-10">
                <h2 className="text-2xl font-bold mb-4 text-white">Login</h2>
                {error && <p className="text-red-500">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            placeholder="Username"
                            type="text"
                            className="w-full p-2 rounded bg-white text-black"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            placeholder="Password"
                            type="password"
                            className="w-full p-2 rounded bg-white text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-black p-2 text-white rounded hover:bg-[#DC143C]">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
