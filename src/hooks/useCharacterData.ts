
import { useState, useEffect, useMemo, useCallback } from "react";
import { getCharacterData } from "@/lib/actions";
import type { CharacterData } from "@/lib/types";

export interface LoadingProgress {
    loaded: number;
    total: number;
}

export function useCharacterData(name: string) {
    const [characterDataMap, setCharacterDataMap] = useState(new Map<string, CharacterData>());
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState<LoadingProgress>({ loaded: 0, total: 0 });

    // 提取唯一的汉字字符，过滤掉非汉字（如中英文标点符号、空格等）
    const uniqueChars = useMemo(() => {
        const characters = name.split("").filter(char => /^[\u4e00-\u9fa5]$/.test(char));
        return [...new Set(characters)];
    }, [name]);

    const fetchCharacterData = useCallback(async (chars: string[]) => {
        if (chars.length === 0) return;

        setIsLoading(true);
        setLoadingProgress({ loaded: 0, total: chars.length });

        try {
            // Process in batches of 20 to avoid overwhelming the server and browser
            const BATCH_SIZE = 20;

            for (let i = 0; i < chars.length; i += BATCH_SIZE) {
                const batch = chars.slice(i, i + BATCH_SIZE);

                const results = await Promise.all(
                    batch.map(char => getCharacterData(char))
                );

                // Immediately update the map so UI can progressively render
                setCharacterDataMap(prevMap => {
                    const newMap = new Map(prevMap);
                    results.forEach((data, index) => {
                        if (data) {
                            newMap.set(batch[index], data as unknown as CharacterData);
                        }
                    });
                    return newMap;
                });

                // Update progress
                setLoadingProgress({
                    loaded: Math.min(i + BATCH_SIZE, chars.length),
                    total: chars.length
                });

                // Yield to main thread between batches
                if (i + BATCH_SIZE < chars.length) {
                    await new Promise(resolve => requestAnimationFrame(resolve));
                }
            }
        } catch (error) {
            console.error("Failed to fetch character data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const newChars = uniqueChars.filter(char => !characterDataMap.has(char));

        if (newChars.length > 0) {
            fetchCharacterData(newChars);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uniqueChars]);

    return {
        characterDataMap,
        isLoading,
        loadingProgress,
        uniqueChars,
        allCharsLoaded: useMemo(() => {
            if (uniqueChars.length === 0) return true;
            return uniqueChars.every(char => characterDataMap.has(char) && characterDataMap.get(char)?.details);
        }, [uniqueChars, characterDataMap])
    };
}
