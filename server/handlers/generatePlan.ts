import type { Diet } from '../../src/domain/types';
import type { Handler } from '../http';
import { sendJson, readJsonBody } from '../http';
import { generateWeekPlan as generateWeekPlanOpenAI } from '../providers/openai';
import { generateWeekPlan as generateWeekPlanXai } from '../providers/xai';
import { generateWeekPlan as generateWeekPlanGroq } from '../providers/groq';
import { generateWeekPlan as generateWeekPlanGemini } from '../providers/gemini';

const VALID_DIETS: Diet[] = ['vegan', 'vegetarian', 'omnivore', 'halal', 'gf'];

const handler: Handler = async (req, res) => {
  const body = (await readJsonBody(req)) as { diet?: unknown; budget?: unknown } | null;
  const diet = body?.diet;
  const budget = body?.budget;
  if (typeof diet !== 'string' || !VALID_DIETS.includes(diet as Diet) || typeof budget !== 'number') {
    sendJson(res, 400, { plan: null });
    return;
  }
  const plan =
    (await generateWeekPlanOpenAI(diet as Diet, budget)) ??
    (await generateWeekPlanXai(diet as Diet, budget)) ??
    (await generateWeekPlanGroq(diet as Diet, budget)) ??
    (await generateWeekPlanGemini(diet as Diet, budget));
  sendJson(res, 200, { plan: plan ?? null });
};

export default handler;
