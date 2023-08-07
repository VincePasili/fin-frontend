import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend, IoMdCloudUpload } from 'react-icons/io';
import 'tailwindcss/tailwind.css';
import axios from 'axios';

const typingDelay = 1000; // delay in ms between each character

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fontSize, setFontSize] = useState('text-xl'); // Default font size
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleInputChange = (e) => {
        setInput(e.target.value);

        // Adjust font size based on input length
        if (e.target.value.length < 10) {
            setFontSize('text-xl');
        } else if (e.target.value.length < 20) {
            setFontSize('text-lg');
        } else {
            setFontSize('text-base');
        }
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSend = async (e) => {
        e.preventDefault();

        if (!input || isLoading) return;

        setIsLoading(true);

        const userMessage = { role: 'user', content: input };
        setMessages(prevMessages => [...prevMessages, userMessage]);

        setInput("");

        // handle file if there's one
        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }

        // Append the chat message to the formData
        formData.append('chats', JSON.stringify([{ role: 'user', content: input }]));

        // Log formData for debugging
        for (var value of formData.values()) {
            console.log(value);
        }

        try {
            const response = await axios.post('http://localhost:8001/uploadfile/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const data = response.data;

            // create a new message for the typing animation
            const typingMessage = { role: 'assistant', content: "" };

            setMessages(prevMessages => [...prevMessages, typingMessage]);
            if (data && data.output && data.output.content) {
                // create typing animation
                for (let i = 0; i < data.output.content.length; i++) {
                    await new Promise(resolve => setTimeout(resolve, typingDelay));
                    typingMessage.content += data.output.content[i];
                    setMessages(prevMessages => {
                        // update the last message with functional update
                        return prevMessages.map((message, index) => {
                            if (index === prevMessages.length - 1) {
                                return typingMessage;
                            } else {
                                return message;
                            }
                        });
                    });
                }
            } else if (data && data.info) {
                // file upload was successful, but there's no chatbot response to display
                typingMessage.content = data.info;
                setMessages(prevMessages => {
                    // update the last message with functional update
                    return prevMessages.map((message, index) => {
                        if (index === prevMessages.length - 1) {
                            return typingMessage;
                        } else {
                            return message;
                        }
                    });
                });
            } else {
                console.error('Unexpected response from server', data);
            }

            setIsLoading(false);
        } catch (error) {
            console.error('There was an error!', error);
            setIsLoading(false);
        }
    }

    return (
        <div className='flex w-full md:w-3/4 flex-col items-center m-20 justify-center'
        >
            <div className=' text-4xl md:text-6xl mb-10 font-extrabold text-slate-100'>
                <h1>
                    AUTOGPT
                </h1>
            </div>
            <div className="flex flex-col bg-blue-100 md:p-4 rounded-lg shadow-lg w-full md:w-2/3">

                <div className="mb-4 px-3">
                    {messages.map((message, index) => (
                        <div key={index} className={`p-2 rounded-lg mb-5 ${message.role === 'assistant' ? 'flex shadow-blue-300 shadow items-start border-l-2 border-blue-700 bg-[#F5F6FA] text-slate-700 mr-auto w-full text-xl' : ' break-words flex shadow shadow-slate-300 text-slate-900 items-end justify-end border-r-2 border-slate-800 bg-blue-200 ml-auto text-xl w-full md:w-2/3'}`}>
                            <p className='break-words break-all'>{message.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} className="flex w-full items-center mb-2">

                    <div className="flex items-center w-full md:flex-row flex-col border bg-slate-300 md:rounded-full relative">
                        <label htmlFor="file-upload" className="text-slate-600 m-2 cursor-pointer">
                            <IoMdCloudUpload size={40} />
                        </label>
                        <input
                            accept='.pdf, .xlsx'
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <input
                            value={input}
                            onChange={handleInputChange}
                            type="text"
                            placeholder="Type your message here..."
                            className={`flex-grow text-start justify-start m-1 py-1 px-5 ${fontSize} bg-slate-100 rounded-full outline-none`}
                            disabled={isLoading}
                        />
                        {/* <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            type="text"
                            placeholder="Type your message here..."
                            className="flex-grow text-start justify-start m-1 py-1 px-5 text-xl bg-slate-100 rounded-full outline-none"
                            disabled={isLoading}
                        /> */}
                        <button type="submit" className="hidden md:absolute md:hidden right-2 text-[#6852F9]" disabled={isLoading}>
                            <IoMdSend size={40} />
                        </button>
                    </div>
                </form>
                {file && <div className="text-center text-sm text-purple-600 font-semibold">File attached: {file.name}</div>}
                {isLoading && <div className="text-center text-sm text-purple-600 font-semibold">Please wait for the response...</div>}
            </div>
        </div>
    );
}
export default Chatbot;
