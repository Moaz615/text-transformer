import React, { useState } from 'react';
import { FileText, Repeat, Copy, Eraser, Loader, Key } from 'lucide-react'; // Added Key icon

// Main App component
const App = () => {
    // State variables for input text, output text, loading status, and messages
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success' or 'error'
    const [summaryLength, setSummaryLength] = useState('standard'); // 'concise', 'standard', 'detailed'
    const [paraphraseStyle, setParaphraseStyle] = useState('formal'); // 'formal', 'casual', 'creative'
    const [apiKey, setApiKey] = useState(''); // New state for API key

    /**
     * Displays a temporary message to the user.
     * @param {string} text - The message text.
     * @param {string} type - The type of message ('success' or 'error').
     */
    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => {
            setMessage({ text: '', type: '' }); // Clear message after 3 seconds
        }, 3000);
    };

    /**
     * Handles the API call to Gemini for text generation.
     * @param {string} prompt - The prompt to send to the Gemini API.
     */
    const callGeminiApi = async (prompt) => {
        if (!apiKey.trim()) {
            showMessage('Please enter your Gemini API key.', 'error');
            return;
        }

        setIsLoading(true); // Set loading state to true
        setOutputText(''); // Clear previous output
        setMessage({ text: '', type: '' }); // Clear previous messages

        try {
            // Gemini API configuration
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            // Use the user-provided API key
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            // Make the API request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            // Check if the response was successful
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorData.error.message || 'Unknown error'}`);
            }

            const result = await response.json();

            // Extract the generated text from the response
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const generatedText = result.candidates[0].content.parts[0].text;
                setOutputText(generatedText);
                showMessage('Operation successful!', 'success');
            } else {
                // Handle cases where the response structure is unexpected or content is missing
                showMessage('No content generated. Please try again.', 'error');
                console.error('Unexpected API response structure:', result);
            }
        } catch (error) {
            // Handle any errors during the fetch operation
            showMessage(`Error: ${error.message}`, 'error');
            console.error('Error calling Gemini API:', error);
        } finally {
            setIsLoading(false); // Reset loading state
        }
    };

    /**
     * Handles the Summarize button click.
     */
    const handleSummarize = () => {
        if (!inputText.trim()) {
            showMessage('Please enter text to summarize.', 'error');
            return;
        }
        let prompt = `Summarize the following text: "${inputText}". `;
        if (summaryLength === 'concise') {
            prompt += 'Make the summary very concise and brief.';
        } else if (summaryLength === 'detailed') {
            prompt += 'Provide a detailed and comprehensive summary.';
        } else { // standard
            prompt += 'Provide a standard length summary.';
        }
        callGeminiApi(prompt);
    };

    /**
     * Handles the Paraphrase button click.
     */
    const handleParaphrase = () => {
        if (!inputText.trim()) {
            showMessage('Please enter text to paraphrase.', 'error');
            return;
        }
        let prompt = `Paraphrase the following text: "${inputText}". `;
        if (paraphraseStyle === 'formal') {
            prompt += 'Use a formal tone and vocabulary.';
        } else if (paraphraseStyle === 'casual') {
            prompt += 'Use a casual and informal tone.';
        } else { // creative
            prompt += 'Be creative and imaginative in your rephrasing.';
        }
        callGeminiApi(prompt);
    };

    /**
     * Handles copying the output text to the clipboard.
     */
    const handleCopy = () => {
        if (outputText) {
            // Use document.execCommand('copy') for better iframe compatibility
            const textarea = document.createElement('textarea');
            textarea.value = outputText;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showMessage('Result copied to clipboard!', 'success');
            } catch (err) {
                showMessage('Failed to copy text. Please copy manually.', 'error');
                console.error('Copy command failed:', err);
            }
            document.body.removeChild(textarea);
        } else {
            showMessage('Nothing to copy!', 'error');
        }
    };

    /**
     * Handles clearing the input text area.
     */
    const handleClearInput = () => {
        setInputText('');
        setOutputText('');
        setMessage({ text: '', type: '' });
        showMessage('Input cleared!', 'success');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-cyan-200 to-emerald-200 animate-gradient-x">
            <div className="backdrop-blur-xl bg-white/70 border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-12 w-full max-w-3xl relative overflow-hidden animate-fade-in">
                {/* Animated Gradient Blobs */}
                <div className="absolute -top-20 -left-20 w-60 h-60 bg-gradient-to-br from-teal-400 to-blue-400 rounded-full opacity-30 blur-2xl z-0"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-gradient-to-tr from-cyan-400 to-green-300 rounded-full opacity-20 blur-2xl z-0"></div>

                {/* Title */}
                <h1 className="text-5xl font-extrabold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 via-teal-600 to-green-700 drop-shadow-lg z-10 relative">
                    Text Transformer
                </h1>

                {/* Message Box */}
                {message.text && (
                    <div className={`fixed top-6 left-1/2 -translate-x-1/2 px-8 py-4 rounded-xl shadow-xl text-white text-lg font-semibold z-50 transition-all duration-300 ${message.type === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'}`}>
                        {message.text}
                    </div>
                )}

                {/* API Key Input */}
                <div className="mb-8 z-10 relative">
                    <label htmlFor="apiKeyInput" className="block text-gray-700 text-lg font-bold mb-3 flex items-center gap-2">
                        <Key className="h-6 w-6 text-gray-600" /> Enter your Gemini API Key:
                    </label>
                    <input
                        type="password" // Use password type for security
                        id="apiKeyInput"
                        className="w-full p-5 rounded-2xl border-none bg-white/80 shadow-inner focus:ring-4 focus:ring-purple-400 text-gray-900 text-base transition-all duration-200"
                        placeholder="Paste your API key here (e.g., AIzaSy...)"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        disabled={isLoading}
                    />
                    <p className="mt-2 text-sm text-gray-600">
                        Get your free API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
                        The app will use this key when you click Summarize or Paraphrase. Your key is not stored.
                    </p>
                </div>

                {/* Input Text Area */}
                <div className="mb-8 z-10 relative">
                    <label htmlFor="inputText" className="block text-gray-700 text-lg font-bold mb-3">
                        Enter your text:
                    </label>
                    <textarea
                        id="inputText"
                        className="w-full p-5 rounded-2xl border-none bg-white/80 shadow-inner focus:ring-4 focus:ring-blue-400 text-gray-900 text-base min-h-[120px] transition-all duration-200"
                        placeholder="Type or paste your text here..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        disabled={isLoading}
                    ></textarea>
                    <button
                        onClick={handleClearInput}
                        className="mt-3 px-4 py-2 bg-gray-200/80 text-gray-700 rounded-full hover:bg-gray-300/90 transition duration-200 text-sm font-medium flex items-center gap-2 shadow"
                        disabled={isLoading}
                    >
                        <Eraser className="h-5 w-5" /> Clear Input
                    </button>
                </div>

                {/* Options Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 z-10 relative">
                    {/* Summarization Options */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white/80 shadow-lg border border-blue-100/40">
                        <h3 className="text-xl font-bold text-blue-700 mb-4">Summarization</h3>
                        <div className="flex flex-col space-y-3">
                            {['concise', 'standard', 'detailed'].map(option => (
                                <label key={option} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                                        name="summaryLength"
                                        value={option}
                                        checked={summaryLength === option}
                                        onChange={(e) => setSummaryLength(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="ml-2 text-gray-700 capitalize">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Paraphrasing Options */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50/80 to-white/80 shadow-lg border border-green-100/40">
                        <h3 className="text-xl font-bold text-green-700 mb-4">Paraphrasing</h3>
                        <div className="flex flex-col space-y-3">
                            {['formal', 'casual', 'creative'].map(option => (
                                <label key={option} className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="radio"
                                        className="form-radio h-5 w-5 text-green-600 focus:ring-green-500"
                                        name="paraphraseStyle"
                                        value={option}
                                        checked={paraphraseStyle === option}
                                        onChange={(e) => setParaphraseStyle(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <span className="ml-2 text-gray-700 capitalize">{option}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 z-10 relative">
                    <button
                        onClick={handleSummarize}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-400 shadow-lg flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin h-5 w-5 mr-3" />
                        ) : (
                            <>
                                <FileText className="h-5 w-5 mr-2" />
                                Summarize
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleParaphrase}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-400 shadow-lg flex items-center justify-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader className="animate-spin h-5 w-5 mr-3" />
                        ) : (
                            <>
                                <Repeat className="h-5 w-5 mr-2" />
                                Paraphrase
                            </>
                        )}
                    </button>
                </div>

                {/* Output Text Area */}
                <div className="mb-6 z-10 relative">
                    <label htmlFor="outputText" className="block text-gray-700 text-lg font-bold mb-3">
                        Result:
                    </label>
                    <textarea
                        id="outputText"
                        className="w-full p-5 rounded-2xl border-none bg-white/80 shadow-inner focus:ring-4 focus:ring-green-400 text-gray-900 text-base min-h-[120px] transition-all duration-200"
                        placeholder="Summarized or paraphrased text will appear here..."
                        value={outputText}
                        readOnly
                    ></textarea>
                </div>

                {/* Copy Button */}
                <button
                    onClick={handleCopy}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-400 shadow-lg flex items-center justify-center z-10 relative"
                >
                    <Copy className="h-5 w-5 mr-2" /> Copy Result
                </button>
            </div>
        </div>
    );
};

export default App;
