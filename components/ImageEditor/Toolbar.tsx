import React from 'react';

interface ToolbarProps {
    onAddText: () => void;
    onAddRect: () => void;
    onAddCircle: () => void;
    onDownload: () => void;
    onFilter: (filter: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ onAddText, onAddRect, onAddCircle, onDownload, onFilter }) => {
    return (
        <div className="flex flex-col gap-4 bg-gray-900 p-4 rounded-lg border border-gray-700 h-full">
            <h3 className="text-white font-bold mb-2">Tools</h3>

            <div className="space-y-2">
                <button
                    onClick={onAddText}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    <span className="text-xl">T</span> Add Text
                </button>

                <button
                    onClick={onAddRect}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    <div className="w-4 h-4 border-2 border-white"></div> Add Rectangle
                </button>

                <button
                    onClick={onAddCircle}
                    className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
                >
                    <div className="w-4 h-4 border-2 border-white rounded-full"></div> Add Circle
                </button>
            </div>

            <div className="border-t border-gray-700 my-2"></div>

            <h3 className="text-white font-bold mb-2">Filters</h3>
            <div className="space-y-2">
                <button
                    onClick={() => onFilter('none')}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
                >
                    None
                </button>
                <button
                    onClick={() => onFilter('grayscale')}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
                >
                    Grayscale
                </button>
                <button
                    onClick={() => onFilter('sepia')}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
                >
                    Sepia
                </button>
                <button
                    onClick={() => onFilter('invert')}
                    className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded"
                >
                    Invert
                </button>
            </div>

            <div className="mt-auto">
                <button
                    onClick={onDownload}
                    className="w-full px-4 py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition-colors"
                >
                    Download Image
                </button>
            </div>
        </div>
    );
};

export default Toolbar;
