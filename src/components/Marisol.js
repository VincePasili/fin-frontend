import React, { useState, useEffect, useRef } from 'react';
import 'tailwindcss/tailwind.css';
import { IoMdSend, IoMdDocument } from 'react-icons/io';

const Marisol = () => {
    const [messages, setMessages] = useState([{role: 'user', content: 'Hi there!'}]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (input.trim() !== '') {
            const userMessage = { role: 'user', content: input };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setInput('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (

        <div className='flex items-center p-10 justify-center'>
            <div className="bg-purple-50 p-4 rounded-lg shadow-lg w-full md:w-2/3">
                <div className="border-b-2 flex items-center justify-center border-gray-200 mb-4">
                    <h1 className="text-2xl font-semibold text-slate-700">AutoGPT</h1>
                </div>
                <div className="overflow-y-scroll h-auto mb-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`p-2 rounded-lg mb-5 ${message.role === 'system' || message.role === 'assistant' ? 'flex shadow-purple-300 shadow items-start border-l-2 border-purple-700 bg-gray-300 mr-auto w-2/3' : ' flex shadow shadow-slate-300 items-end justify-end border-r-2 border-cyan-700 bg-slate-300 ml-auto w-2/3'}`}>
                            <p>{message.content}</p>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSubmit} className="flex items-center">
            <div className="flex-grow flex items-center border rounded-full relative">
                <input
                    id="input"
                    name="input"
                    type="text"
                    onChange={handleInputChange}
                    value={input}
                    placeholder="Type your message here..."
                    className="flex-grow text-center text-lg bg-slate-100 rounded-full outline-none"
                    disabled={isLoading}
                />
                <button type="submit" className="absolute right-8 text-slate-600" disabled={isLoading}>
                    <IoMdSend />
                </button>
                <label htmlFor="file-upload" className="absolute left-2 text-slate-600 cursor-pointer">
                    <IoMdDocument />
                    <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="hidden"
                        onChange={console.log('done')}
                    />
                </label>
            </div>
            {uploadedFile && <div className="text-center text-sm text-purple-600 font-semibold">{uploadedFile.name}</div>}
        </form>
    {isLoading && <div className="mt-2 text-center text-sm text-purple-600 font-semibold">Please wait for the response...</div>}
</div>
</div>
);
};

export default Marisol;
