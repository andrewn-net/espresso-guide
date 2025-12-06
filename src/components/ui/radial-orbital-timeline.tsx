"use client";
import { useState, useRef, useEffect } from "react";
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
    const [isMobile, setIsMobile] = useState<boolean>(false);

    const [centerOffset, _setCenterOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const orbitRef = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === containerRef.current || e.target === orbitRef.current) {
            setExpandedItems({});
        }
    };

    const centerViewOnNode = (nodeId: number) => {
        if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

        const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
        const totalNodes = timelineData.length;
        const targetAngle = (nodeIndex / totalNodes) * 360;

        setRotationAngle(270 - targetAngle);
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

    const calculateNodePosition = (index: number, total: number) => {
        const angle = ((index / total) * 360 + rotationAngle) % 360;
        const radius = isMobile ? 130 : 250;
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
            className="w-full h-[100dvh] flex flex-col items-center justify-center bg-black overflow-hidden"
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
                    <div className={`absolute rounded-full bg-stone-900 flex items-center justify-center z-10 border border-white/10 shadow-2xl transition-all duration-500 ${isMobile ? 'w-20 h-20' : 'w-28 h-28'}`}>
                        <Coffee className="text-white/90" size={isMobile ? 24 : 36} strokeWidth={1.5} />
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
                  rounded-full flex items-center justify-center
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
                  ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
                  ${isExpanded ? "scale-125" : ""}
                `}
                                >
                                    <Icon size={isMobile ? 16 : 20} />
                                </div>

                                <div
                                    className={`
                  absolute whitespace-nowrap
                  text-xs font-semibold tracking-wider
                  transition-all duration-300
                  ${isMobile ? 'top-11' : 'top-14'}
                  left-1/2 -translate-x-1/2
                  ${isExpanded ? "text-white scale-110" : "text-white/70"}
                `}
                                >
                                    {item.title}
                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* Render Active Card Overlay/Sheet outside of transformed container */}
                {Object.keys(expandedItems).map((key) => {
                    if (!expandedItems[parseInt(key)]) return null;
                    const activeItem = timelineData.find(item => item.id === parseInt(key));
                    if (!activeItem) return null;

                    return (
                        <Card
                            key={activeItem.id}
                            className={`
                                ${isMobile
                                    ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md'
                                    : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72'
                                }
                                bg-neutral-900/95 backdrop-blur-md border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-[999]
                                animate-in fade-in zoom-in-95 duration-200
                            `}
                            style={!isMobile ? {
                                top: `calc(50% + 140px)`,
                                left: `50%`,
                                transform: 'translateX(-50%)'
                            } : {}}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!isMobile && <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>}
                            <CardHeader className="pb-2 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-mono text-amber-500 tracking-widest uppercase">
                                        Classic Coffee
                                    </span>
                                </div>
                                <CardTitle className="text-xl mt-1 font-bold text-white tracking-tight">
                                    {activeItem.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-neutral-300 pb-4">
                                <div className="mb-4 leading-relaxed">{activeItem.content}</div>

                                <div className="pt-3 border-t border-white/5">
                                    <div className="flex justify-between items-center text-xs mb-2">
                                        <span className="flex items-center text-neutral-400">
                                            <Zap size={12} className="mr-1.5" />
                                            Caffeine Intensity
                                        </span>
                                        <span className="font-mono text-white">{activeItem.energy}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-700 to-amber-500"
                                            style={{ width: `${activeItem.energy}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
