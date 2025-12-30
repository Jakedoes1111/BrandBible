import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import Toolbar from './Toolbar';

interface ImageEditorProps {
    initialImageUrl?: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ initialImageUrl }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (canvasRef.current && !canvas) {
            const newCanvas = new fabric.Canvas(canvasRef.current, {
                width: 800,
                height: 600,
                backgroundColor: '#1f2937', // gray-800
            });
            setCanvas(newCanvas);

            // Handle resize
            const resizeCanvas = () => {
                if (containerRef.current) {
                    const width = containerRef.current.clientWidth;
                    const height = containerRef.current.clientHeight;
                    newCanvas.setDimensions({ width, height });
                }
            };

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas();

            return () => {
                newCanvas.dispose();
                window.removeEventListener('resize', resizeCanvas);
            };
        }
    }, [canvasRef]);

    useEffect(() => {
        if (canvas && initialImageUrl) {
            fabric.Image.fromURL(initialImageUrl).then((img) => {
                if (img) {
                    // Scale image to fit canvas
                    const scale = Math.min(
                        (canvas.width! - 40) / img.width!,
                        (canvas.height! - 40) / img.height!
                    );

                    img.scale(scale);
                    img.set({
                        left: canvas.width! / 2,
                        top: canvas.height! / 2,
                        originX: 'center',
                        originY: 'center'
                    });

                    canvas.add(img);
                    canvas.setActiveObject(img);
                    canvas.renderAll();
                }
            }).catch(err => {
                console.error("Error loading image:", err);
            });
        }
    }, [canvas, initialImageUrl]);

    const addText = () => {
        if (!canvas) return;
        const text = new fabric.IText('Double click to edit', {
            left: 100,
            top: 100,
            fontFamily: 'Arial',
            fill: '#ffffff',
            fontSize: 40,
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addRect = () => {
        if (!canvas) return;
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: 'rgba(255,0,0,0.5)',
            width: 100,
            height: 100,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
    };

    const addCircle = () => {
        if (!canvas) return;
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            fill: 'rgba(0,255,0,0.5)',
            radius: 50,
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
    };

    const applyFilter = (filterType: string) => {
        if (!canvas) return;
        const activeObject = canvas.getActiveObject();

        if (activeObject && activeObject instanceof fabric.Image) {
            // Remove existing filters
            activeObject.filters = [];

            switch (filterType) {
                case 'grayscale':
                    activeObject.filters.push(new fabric.filters.Grayscale());
                    break;
                case 'sepia':
                    activeObject.filters.push(new fabric.filters.Sepia());
                    break;
                case 'invert':
                    activeObject.filters.push(new fabric.filters.Invert());
                    break;
                default:
                    // None
                    break;
            }

            activeObject.applyFilters();
            canvas.renderAll();
        } else {
            alert("Please select an image to apply filters.");
        }
    };

    const downloadImage = () => {
        if (!canvas) return;
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2, // High res
        });

        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-[calc(100vh-200px)] gap-4">
            <div className="w-64 flex-shrink-0">
                <Toolbar
                    onAddText={addText}
                    onAddRect={addRect}
                    onAddCircle={addCircle}
                    onDownload={downloadImage}
                    onFilter={applyFilter}
                />
            </div>
            <div className="flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative" ref={containerRef}>
                <canvas ref={canvasRef} className="w-full h-full" />
                {!initialImageUrl && !canvas?.getObjects().length && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-gray-500">Add content or upload an image to start editing</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageEditor;
