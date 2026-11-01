// src/lib/constants.ts

export interface ZoneBenchmark {
  name: string;
  totalSchools: number;
}

export const DISTRICT_ZONE_TARGETS: Record<string, number> = {
  Chamkote: 82,
  Drugmulla: 89,
  Handwara: 155,
  Khumriyal: 180,
  Kralpora: 171,
  Kupwara: 149,
  Langate: 140,
  Mawer: 150,
  Rajwar: 110,
  Sogam: 153,
  Tangdar: 93,
  Trehgam: 114,
  Villgam: 113,
};

// Total District Kupwara Benchmark (Sum: 1,699)
export const TOTAL_DISTRICT_BENCHMARK = Object.values(DISTRICT_ZONE_TARGETS).reduce(
  (sum, count) => sum + count,
  0
);