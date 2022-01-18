import RandomOrg from "random-org";

const apiKey = process.env.RANDOM_ORG_API as string;

export const getPseudoRandom = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const getTrueRandom = async (
  min: number,
  max: number,
): Promise<number> =>
  await new RandomOrg({ apiKey })
    .generateIntegers({ min, max, n: 1 })
    .then((result) => result.random.data[0]);
