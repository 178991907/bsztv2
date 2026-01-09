'use server';

import type { CharacterDetails, StrokeSistine } from './types';
import { unstable_cache as cache } from 'next/cache';
import cnchar from 'cnchar';
import radical from 'cnchar-radical';

// Initialize cnchar with radical plugin
cnchar.use(radical);

// Fallback dictionary for common characters
const characterDict: Record<string, Partial<CharacterDetails>> = {
  '王': { pinyin: ['wáng'], radical: '王', structure: '单一' },
  '小': { pinyin: ['xiǎo'], radical: '小', structure: '单一' },
  '明': { pinyin: ['míng'], radical: '日', structure: '左右' },
  '李': { pinyin: ['lǐ'], radical: '木', structure: '上下' },
  '张': { pinyin: ['zhāng'], radical: '弓', structure: '左右' },
  '刘': { pinyin: ['liú'], radical: '刀', structure: '左右' },
  '陈': { pinyin: ['chén'], radical: '阝', structure: '左右' },
  '杨': { pinyin: ['yáng'], radical: '木', structure: '左右' },
  '黄': { pinyin: ['huáng'], radical: '黄', structure: '上中下' },
  '赵': { pinyin: ['zhào'], radical: '走', structure: '半包围' },
  '吴': { pinyin: ['wú'], radical: '口', structure: '上下' },
  '周': { pinyin: ['zhōu'], radical: '口', structure: '全包围' },
  '徐': { pinyin: ['xú'], radical: '彳', structure: '左右' },
  '孙': { pinyin: ['sūn'], radical: '子', structure: '左右' },
  '马': { pinyin: ['mǎ'], radical: '马', structure: '单一' },
  '朱': { pinyin: ['zhū'], radical: '木', structure: '单一' },
  '胡': { pinyin: ['hú'], radical: '月', structure: '左右' },
  '林': { pinyin: ['lín'], radical: '木', structure: '左右' },
  '郭': { pinyin: ['guō'], radical: '阝', structure: '左右' },
  '何': { pinyin: ['hé'], radical: '人', structure: '左右' },
  '高': { pinyin: ['gāo'], radical: '高', structure: '上下' },
  '罗': { pinyin: ['luó'], radical: '罒', structure: '上下' },
  '郑': { pinyin: ['zhèng'], radical: '阝', structure: '左右' },
  '梁': { pinyin: ['liáng'], radical: '木', structure: '上下' },
  '谢': { pinyin: ['xiè'], radical: '言', structure: '左右' },
  '宋': { pinyin: ['sòng'], radical: '宀', structure: '上下' },
  '唐': { pinyin: ['táng'], radical: '口', structure: '半包围' },
  '许': { pinyin: ['xǔ'], radical: '言', structure: '左右' },
  '邓': { pinyin: ['dèng'], radical: '阝', structure: '左右' },
  '冯': { pinyin: ['féng'], radical: '冫', structure: '左右' },
  '韩': { pinyin: ['hán'], radical: '韦', structure: '左右' },
  '曹': { pinyin: ['cáo'], radical: '曰', structure: '上下' },
  '曾': { pinyin: ['céng'], radical: '曰', structure: '上中下' },
  '彭': { pinyin: ['péng'], radical: '彡', structure: '左右' },
  '萧': { pinyin: ['xiāo'], radical: '艹', structure: '上下' },
  '蔡': { pinyin: ['cài'], radical: '艹', structure: '上下' },
  '潘': { pinyin: ['pān'], radical: '氵', structure: '左右' },
  '田': { pinyin: ['tián'], radical: '田', structure: '单一' },
  '董': { pinyin: ['dǒng'], radical: '艹', structure: '上下' },
  '袁': { pinyin: ['yuán'], radical: '衣', structure: '上下' },
  '于': { pinyin: ['yú'], radical: '二', structure: '单一' },
  '余': { pinyin: ['yú'], radical: '人', structure: '上下' },
  '叶': { pinyin: ['yè'], radical: '口', structure: '左右' },
  '蒋': { pinyin: ['jiǎng'], radical: '艹', structure: '上下' },
  '杜': { pinyin: ['dù'], radical: '木', structure: '左右' },
  '苏': { pinyin: ['sū'], radical: '艹', structure: '上下' },
  '魏': { pinyin: ['wèi'], radical: '鬼', structure: '左右' },
  '程': { pinyin: ['chéng'], radical: '禾', structure: '左右' },
  '吕': { pinyin: ['lǚ'], radical: '口', structure: '上下' },
  '丁': { pinyin: ['dīng'], radical: '一', structure: '单一' },
  '沈': { pinyin: ['shěn'], radical: '氵', structure: '左右' },
  '任': { pinyin: ['rèn'], radical: '人', structure: '左右' },
  '姚': { pinyin: ['yáo'], radical: '女', structure: '左右' },
  '卢': { pinyin: ['lú'], radical: '卜', structure: '上下' },
  '傅': { pinyin: ['fù'], radical: '人', structure: '左右' },
  '钟': { pinyin: ['zhōng'], radical: '钅', structure: '左右' },
  '姜': { pinyin: ['jiāng'], radical: '女', structure: '上下' },
  '崔': { pinyin: ['cuī'], radical: '山', structure: '左右' },
  '谭': { pinyin: ['tán'], radical: '言', structure: '左右' },
  '廖': { pinyin: ['liào'], radical: '广', structure: '半包围' },
  '范': { pinyin: ['fàn'], radical: '艹', structure: '上下' },
  '汪': { pinyin: ['wāng'], radical: '氵', structure: '左右' },
  '陆': { pinyin: ['lù'], radical: '阝', structure: '左右' },
};

// Using cnchar library and fallback dictionary to get character details
const getCharacterDetailsFromCnchar = (character: string): CharacterDetails => {
  if (!/^[\u4e00-\u9fa5]$/.test(character)) {
    return {
      character,
      pinyin: ['N/A'],
      radical: 'N/A',
      structure: 'N/A',
    };
  }
  
  try {
    // First try to get from cnchar
    let pinyin: string[] = ['N/A'];
    let radical = 'N/A';
    let structure = 'N/A';
    
    // Try to get pinyin from cnchar
    try {
      const pinyinResult = cnchar.spell(character, 'tone', 'array');
      if (Array.isArray(pinyinResult) && pinyinResult.length > 0) {
        pinyin = pinyinResult;
      } else if (typeof pinyinResult === 'string' && pinyinResult !== '') {
        pinyin = [pinyinResult];
      }
    } catch (e) {
      console.warn(`Failed to get pinyin for ${character} from cnchar`);
    }
    
    // Try to get radical and structure from cnchar
    try {
      const radicalData = cnchar.radical(character);
      if (radicalData && Array.isArray(radicalData) && radicalData.length > 0) {
        radical = radicalData[0]?.radical || 'N/A';
        structure = radicalData[0]?.struct || 'N/A';
      }
    } catch (e) {
      console.warn(`Failed to get radical for ${character} from cnchar`);
    }
    
    // Fallback to our dictionary if cnchar failed
    const fallbackData = characterDict[character];
    if (fallbackData) {
      if (pinyin[0] === 'N/A' && fallbackData.pinyin) {
        pinyin = fallbackData.pinyin;
      }
      if (radical === 'N/A' && fallbackData.radical) {
        radical = fallbackData.radical;
      }
      if (structure === 'N/A' && fallbackData.structure) {
        structure = fallbackData.structure;
      }
    }

    return {
      character,
      pinyin,
      radical,
      structure,
    };
  } catch (error) {
    console.error(`Failed to get details for character "${character}":`, error);
    
    // Final fallback to dictionary
    const fallbackData = characterDict[character];
    if (fallbackData) {
      return {
        character,
        pinyin: fallbackData.pinyin || ['N/A'],
        radical: fallbackData.radical || 'N/A',
        structure: fallbackData.structure || 'N/A',
      };
    }
    
    return {
      character,
      pinyin: ['N/A'],
      radical: 'N/A',
      structure: 'N/A',
    };
  }
};


export const getCharacterStrokeSVGs = cache(
  async (character: string): Promise<StrokeSistine> => {
    try {
      const response = await fetch(
        `https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${character}.json`
      );
      if (!response.ok) {
        console.warn(`No stroke data found for character: ${character}`);
        return { strokes: [], medians: [] };
      }
      const data = await response.json();
      return {
        strokes: data.strokes as string[],
        medians: data.medians as number[][][],
      };
    } catch (error) {
      console.error(
        `Failed to fetch character stroke data for ${character}:`,
        error
      );
      // Return empty data but don't re-throw, allowing the app to continue.
      return { strokes: [], medians: [] };
    }
  },
  ['character-strokes-data'],
  { revalidate: 3600 * 24 } // Cache for a day
);

export const getCharacterData = async (character: string) => {
  // Stroke data is fetched from a CDN and cached.
  const strokesData = await getCharacterStrokeSVGs(character);
  
  // Character details (pinyin, radical, structure) are fetched locally using cnchar.
  // This is a synchronous operation, but the function is async to be a valid Server Action.
  const details = getCharacterDetailsFromCnchar(character);

  return {
    details,
    strokesData,
  };
};
