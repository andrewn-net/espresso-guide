"use client";
import { useState, useRef } from "react";
import { Zap, Coffee } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
    id: number;
    title: string;
    date: string;
    content: React.ReactNode;
    category: string;
    icon: React.ElementType;


    energy: number;
}

interface RadialOrbitalTimelineProps {
    timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
    timelineData,
}: RadialOrbitalTimelineProps) {
    const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
        {}
    );
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [viewMode, _setViewMode] = useState<"orbital">("orbital");
    const [rotationAngle, setRotationAngle] = useState<number>(0);

    const [centerOffset, _setCenterOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
        }
    };

    const toggleItem = (id: number) => {
        setExpandedItems((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (parseInt(key) !== id) {
                    newState[parseInt(key)] = false;
                }
            });

            newState[id] = !prev[id];

            if (!prev[id]) {
                centerViewOnNode(id);
            }

            return newState;
        });
    };

    const centerViewOnNode = (nodeId: number) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        setRotationAngle(270 - targetAngle);
    };

    const calculateNodePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = 200;
        const radian = (angle * Math.PI) / 180;

        const x = radius * Math.cos(radian) + centerOffset.x;
        const y = radius * Math.sin(radian) + centerOffset.y;

        const zIndex = Math.round(100 + 50 * Math.cos(radian));
        const opacity = Math.max(
            0.4,
            Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
        );

        return { x, y, angle, zIndex, opacity };
    };





    return (
        <div
            className="w-full h-screen flex flex-col items-center justify-center bg-black overflow-hidden"
            ref={containerRef}
            onClick={handleContainerClick}
        >
            <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
                <div
                    className="absolute w-full h-full flex items-center justify-center"
                    ref={orbitRef}
                    style={{
                        perspective: "1000px",
                        transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
                    }}
                >
                    {/* Center Coffee Anchor - Flat/Minimal */}
                    <div className="absolute w-24 h-24 rounded-full bg-stone-900 flex items-center justify-center z-10 border border-white/10 shadow-2xl">
                        <Coffee className="text-white/90" size={32} strokeWidth={1.5} />
                    </div>



                    {timelineData.map((item, index) => {
                        const position = calculateNodePosition(index, timelineData.length);
                        const isExpanded = expandedItems[item.id];


                        const Icon = item.icon;

                        const nodeStyle = {
                            transform: `translate(${position.x}px, ${position.y}px)`,
                            zIndex: isExpanded ? 200 : position.zIndex,
                            opacity: isExpanded ? 1 : position.opacity,
                        };

                        return (
                            <div
                                key={item.id}
                                ref={(el: HTMLDivElement | null) => { nodeRefs.current[item.id] = el; }}
                                className="absolute transition-all duration-700 cursor-pointer"
                                style={nodeStyle}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(item.id);
                                }}
                            >
                                <div
                                    className={`absolute rounded-full -inset-1`}
                                    style={{
                                        background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                                        width: `${item.energy * 0.5 + 40}px`,
                                        height: `${item.energy * 0.5 + 40}px`,
                                        left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                        top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                                    }}
                                ></div>

                                <div
                                    className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isExpanded
                                            ? "bg-white text-black"
                                            : "bg-black text-white"
                                        }
                  border-2 
                  ${isExpanded
                                            ? "border-white shadow-lg shadow-white/30"
                                            : "border-white/40"
                                        }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-150" : ""}
                `}
                                >
                                    <Icon size={16} />
                                </div>

                                <div
                                    className={`
                  absolute top-12  whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isExpanded ? "text-white scale-125" : "text-white/70"}
                `}
                                >
                                    {item.title}
                                </div>

                                {isExpanded && (
                                    <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible z-[999]">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-mono text-white/50">
                                                    {item.date}
                                                </span>
                                            </div>
                                            <CardTitle className="text-sm mt-2 font-bold text-white">
                                                {item.title}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-xs text-white/80">
                                            <div className="mt-2">{item.content}</div>

                                            <div className="mt-4 pt-3 border-t border-white/10">
                                                <div className="flex justify-between items-center text-xs mb-1">
                                                    <span className="flex items-center text-white/70">
                                                        <Zap size={10} className="mr-1" />
                                                        Intensity
                                                    </span>
                                                    <span className="font-mono">{item.energy}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                        style={{ width: `${item.energy}%` }}
                                                    ></div>
                                                </div>
                                            </div>


                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
