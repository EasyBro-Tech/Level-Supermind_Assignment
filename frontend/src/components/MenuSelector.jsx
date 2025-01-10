import React, { useState } from "react";
import axios from "axios";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { FaInstagram } from "react-icons/fa";
import { AiOutlineLinkedin, AiOutlineYoutube } from "react-icons/ai";
import { serverUrl } from "../urlconfig";

const MenuSelector = () => {
    const [selection, setSelection] = useState("Reels");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        setResponse(null);
        setError(null);

        try {
            const res = await axios.post(`${serverUrl}/requestAnalysis`, {
                posttype: selection.toLowerCase(),
            });

            setResponse(res.data.message || res.data);
            setIsModalOpen(true);
        } catch (error) {
            setError(error.response.data.msg || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSelection("Reels");
        setResponse(null);
        setError(null);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 text-white">
            {/* Navbar */}
            <div>
                <nav className="max-w-md mx-auto mt-4 p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-md text-gray-800 border border-white border-opacity-30 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                        <span className="text-sm font-bold text-gray-100">Developed by</span>
                        <strong className="font-semibold text-white">Easybro</strong>
                    </div>
                    <div className="flex space-x-4">
                        <a
                            href="https://www.youtube.com/@EassyBro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-red-500"
                            aria-label="Youtube"
                        >
                            <AiOutlineYoutube className="h-6 w-6 text-white" />
                        </a>
                        <a
                            href="https://www.linkedin.com/company/easybro"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-blue-700"
                            aria-label="LinkedIn"
                        >
                            <AiOutlineLinkedin className="h-6 w-6 text-white" />
                        </a>
                        <a
                            href="https://www.instagram.com/easybro.tech/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-all hover:text-pink-500"
                            aria-label="Instagram"
                        >
                            <FaInstagram className="h-6 w-6 text-white" />
                        </a>
                    </div>

                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-md p-6 bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-lg text-gray-800 border border-white border-opacity-30">
                    {/* Title */}
                    <h2 className="text-3xl font-bold mb-6 text-center text-white">
                        Social Media <span className="text-slate-100">Performance Analytics</span>
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-gray-100 mb-6 text-center">
                        This model operates using the prefilled data that was provided during the execution of the flow.
                    </p>

                    {/* Dropdown Menu */}
                    <div className="mb-4">
                        <label htmlFor="selection" className="block text-sm font-medium text-gray-100 mb-1">
                            Select Content Type:
                        </label>
                        <select
                            id="selection"
                            value={selection}
                            onChange={(e) => setSelection(e.target.value)}
                            className="block w-full px-4 py-2 bg-gray-100 bg-opacity-70 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                        >
                            <option value="Reels">Reels</option>
                            <option value="Carousel">Carousel</option>
                            <option value="Static Images">Static Images</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-4">
                        <button
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Fetching..." : "Submit"}
                        </button>
                        <button
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                            onClick={handleReset}
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Analysis Results</h3>
                        {response && (
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {response
                                    .split("<br>")
                                    .filter(line => line.trim() !== "") 
                                    .map((line, index) => (
                                        <span key={index}>
                                            {line}
                                            <br />
                                        </span>
                                    ))}
                            </p>
                        )}
                        {error && (
                            <div className="p-4 bg-red-100 text-red-800 rounded-md flex items-center space-x-2 mt-4">
                                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                                <p className="text-lg">{error}</p>
                            </div>
                        )}
                        <div className="    text-center">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-lg font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuSelector;
