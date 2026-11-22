import { quantumChapters } from "@/data/quantumChapters";
import { curriculumModules } from "@/data/quantumCurriculum";
import { QUANTUM_TEMPLATES } from "@/lib/quantum/templates";

/**
 * Numbers shown in marketing copy, derived from the real data so they
 * stay accurate as the curriculum grows.
 */
export const platformFacts = {
  chapters: quantumChapters.length,
  modules: curriculumModules.length,
  topics: curriculumModules.reduce((sum, module) => sum + module.topics.length, 0),
  algorithmTemplates: QUANTUM_TEMPLATES.length,
  sdks: ["Qiskit", "PennyLane", "Cirq"],
} as const;
