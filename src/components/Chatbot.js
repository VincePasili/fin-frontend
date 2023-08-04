import React, { useState, useEffect, useRef } from 'react';
import { IoMdSend, IoMdCloudUpload } from 'react-icons/io';
import 'tailwindcss/tailwind.css';
import axios from 'axios';

const typingDelay = 10; // delay in ms between each character

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    // const scrollToBottom = () => {
    //     setTimeout(() => {
    //         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    //     }, 5);
    // };

    useEffect(scrollToBottom, [messages]);

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

            // Rest of your code...


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
                        // update the last message
                        const newMessages = [...prevMessages];
                        newMessages[newMessages.length - 1] = typingMessage;
                        return newMessages;
                    });
                }
            } else if (data && data.info) {
                // file upload was successful, but there's no chatbot response to display
                typingMessage.content = data.info;
                setMessages(prevMessages => {
                    // update the last message
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1] = typingMessage;
                    return newMessages;
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

//     return (
//         <div className='flex items-center p-10 justify-center'>
//             <div className="bg-purple-50 p-4 rounded-lg shadow-lg w-full md:w-2/3">
//                 {/* ... other parts of the component are the same ... */}
//                 <form onSubmit={handleSend} className="flex items-center">
//                     <label htmlFor="file-upload" className="mr-2 text-slate-600 cursor-pointer">
//                         <IoMdCloudUpload size={20} />
//                     </label>
//                     <input
//                         id="file-upload"
//                         type="file"
//                         className="hidden" // hide the default file input
//                         onChange={handleFileChange}
//                     />
//                     <div className="flex-grow flex items-center border rounded-full relative">
//                         <input
//                             value={input}
//                             onChange={e => setInput(e.target.value)}
//                             type="text"
//                             placeholder="Type your message here..."
//                             className="flex-grow text-center text-lg bg-slate-100 rounded-full outline-none"
//                             disabled={isLoading}
//                         />
//                         <button type="submit" className="absolute right-2 text-slate-600" disabled={isLoading}>
//                             <IoMdSend />
//                         </button>
//                     </div>
//                 </form>
//                 {file && <div className="mt-2 text-center text-sm text-purple-600 font-semibold">File attached: {file.name}</div>}
//                 {isLoading && <div className="mt-2 text-center text-sm text-purple-600 font-semibold">Please wait for the response...</div>}
//                 <div className="overflow-y-scroll h-auto mb-4">
//                     {messages.map((message, index) => (
//                         <div key={index} className={`p-2 rounded-lg mb-5 ${message.role === 'assistant' ? 'flex shadow-purple-300 shadow items-start border-l-2 border-purple-700 bg-gray-300 mr-auto w-2/3' : ' flex shadow shadow-slate-300 items-end justify-end border-r-2 border-cyan-700 bg-slate-300 ml-auto w-2/3'}`}>
//                             <p>{message.content}</p>
//                         </div>
//                     ))}
//                     <div ref={messagesEndRef} />
//                 </div>
//             </div>
//         </div>
//     );
// };
return (
  <div className='flex flex-col items-center bg-[#F4F4FF] md:p-10 justify-center'>
            <div className=' text-4xl md:text-6xl mb-10 font-extrabold text-slate-500'>
            <h1>
                AUTOGPT
            </h1>
        </div>
    <div className="flex flex-col bg-white md:p-4 rounded-lg shadow-lg w-full md:w-2/3 h-screen justify-between">

      <div className="overflow-y-scroll h-screen mb-4 px-3">
        {messages.map((message, index) => (
          <div key={index} className={`p-2 rounded-lg mb-5 ${message.role === 'assistant' ? 'flex shadow-purple-300 shadow items-start border-l-2 border-purple-700 bg-[#F5F6FA] text-slate-700 mr-auto w-full md:w-2/3' : ' flex shadow shadow-slate-300 text-white items-end justify-end border-r-2 border-cyan-700 bg-[#6852F9] ml-auto w-full md:w-2/3'}`}>
            <p>{message.content}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center mb-2">

        <div className="flex-grow flex items-center border bg-gray-300 rounded-full relative">
                    <label htmlFor="file-upload" className="text-slate-600 cursor-pointer">
          <IoMdCloudUpload size={30} />
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            type="text"
            aria-rowcount={2}
            placeholder="Type your message here..."
            className="flex-grow text-center py-1 text-lg bg-slate-100 rounded-full outline-none"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-2 text-[#6852F9]" disabled={isLoading}>
            <IoMdSend size={30} />
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
