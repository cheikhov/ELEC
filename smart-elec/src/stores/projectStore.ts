/**
 * SMART ELEC — Project Data & Engineering Calculations Store
 *
 * Implements full CRUD, load management, assumptions, and automatic
 * recalculation pipeline when inputs change.
 * LocalStorage persistence with sample demo project on first launch.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Project, ElectricalLoad, Assumption, CableSizingInput } from '../types';
import { createDemoProject } from '../data/demoProject';
import { calculatePowerBalance } from '../engine/powerBalance';
import { calculateGeneratorSizing } from '../engine/generatorSizing';
import { calculateCableSizing } from '../engine/cableSizing';
import { calculateProtection } from '../engine/protectionSelection';

interface ProjectContextType {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  setCurrentProjectId: (id: string | null) => void;
  createProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project;
  addLoad: (projectId: string, loadData: Omit<ElectricalLoad, 'id'>) => void;
  updateLoad: (projectId: string, loadId: string, updates: Partial<ElectricalLoad>) => void;
  deleteLoad: (projectId: string, loadId: string) => void;
  addAssumption: (projectId: string, description: string) => void;
  deleteAssumption: (projectId: string, assumptionId: string) => void;
  recalculateProject: (projectId: string) => void;
  addCableCalculation: (projectId: string, input: CableSizingInput) => void;
  deleteCableCalculation: (projectId: string, index: number) => void;
  loadDemo: () => void;
  clearAllProjects: () => void;
}

const STORAGE_KEY = 'smart-elec-projects-v1';
const CURRENT_ID_KEY = 'smart-elec-current-id-v1';

const ProjectContext = createContext<ProjectContextType>({} as any);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse stored projects:', e);
    }
    // Initialize with realistic demo project
    const demo = createDemoProject();
    return [demo];
  });

  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem(CURRENT_ID_KEY);
    if (saved) return saved;
    return 'demo-project-commercial';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects to localStorage:', e);
    }
  }, [projects]);

  const setCurrentProjectId = useCallback((id: string | null) => {
    setCurrentProjectIdState(id);
    if (id) {
      localStorage.setItem(CURRENT_ID_KEY, id);
    } else {
      localStorage.removeItem(CURRENT_ID_KEY);
    }
  }, []);

  const currentProject = useMemo(() => {
    if (!currentProjectId) return projects[0] || null;
    return projects.find(p => p.id === currentProjectId) || projects[0] || null;
  }, [projects, currentProjectId]);

  // Execute full deterministic recalculation for a project
  const computeCalculations = useCallback((project: Project): Project => {
    const pb = calculatePowerBalance(project.loads, project.network);
    const gen = calculateGeneratorSizing(project.loads, project.network, 0.15);

    // Recalculate existing cable sizing studies or create default main feeder
    let cables = project.calculations.cableSizing;
    if (cables.length === 0 && pb.estimatedCurrent_A > 0) {
      const defaultMainFeeder = calculateCableSizing({
        loadCurrent_A: pb.estimatedCurrent_A,
        cableLength_m: 30,
        conductorMaterial: 'copper',
        insulationType: 'XLPE',
        installationMethod: 'B1',
        ambientTemperature_C: 40,
        cableGrouping: 1,
        numberOfLoadedConductors: project.network.phaseType === 'three_phase' ? 3 : 2,
        permittedVoltageDrop_percent: 3.0,
        shortCircuitCurrent_kA: 10,
        shortCircuitDuration_s: 0.1,
        networkVoltage_V: project.network.supplyVoltage,
        phaseType: project.network.phaseType,
      });
      cables = [defaultMainFeeder];
    } else if (cables.length > 0) {
      // Re-run the first main cable with updated current
      const primaryInput = cables[0].trace.inputs;
      const updatedCable = calculateCableSizing({
        loadCurrent_A: pb.estimatedCurrent_A,
        cableLength_m: Number(primaryInput['Cable length (m)']) || 30,
        conductorMaterial: (primaryInput['Material'] as any) || 'copper',
        insulationType: (primaryInput['Insulation'] as any) || 'XLPE',
        installationMethod: (primaryInput['Installation method'] as any) || 'B1',
        ambientTemperature_C: Number(primaryInput['Ambient temperature (°C)']) || 40,
        cableGrouping: Number(primaryInput['Cable grouping']) || 1,
        numberOfLoadedConductors: project.network.phaseType === 'three_phase' ? 3 : 2,
        permittedVoltageDrop_percent: Number(primaryInput['Permitted voltage drop (%)']) || 3.0,
        shortCircuitCurrent_kA: 10,
        shortCircuitDuration_s: 0.1,
        networkVoltage_V: project.network.supplyVoltage,
        phaseType: project.network.phaseType,
      });
      cables = [updatedCable, ...cables.slice(1)];
    }

    const protections = calculateProtection({
      designCurrent_A: pb.estimatedCurrent_A,
      cableCapacity_A: cables[0]?.derated_currentCapacity_A || 0,
      shortCircuitCurrent_kA: 10,
      phaseType: project.network.phaseType,
      loadType: 'other',
      isMotor: false,
    });

    return {
      ...project,
      updatedAt: new Date().toISOString(),
      calculations: {
        powerBalance: pb,
        generatorSizing: gen,
        cableSizing: cables,
        protectionRecommendations: protections,
        lastCalculated: new Date().toISOString(),
      },
    };
  }, []);

  const createProject = useCallback((data: Partial<Project>): Project => {
    const newProj: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name || 'Nouveau Projet Électrique',
      client: data.client || 'Client non spécifié',
      address: data.address || 'Algérie',
      projectType: data.projectType || 'commercial',
      description: data.description || '',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDemo: false,
      network: data.network || {
        supplyVoltage: 400,
        phaseType: 'three_phase',
        frequency: 50,
        neutralSystem: 'TN-S',
        notes: '',
      },
      assumptions: data.assumptions || [
        {
          id: `asm-${Date.now()}`,
          description: 'Calculs préliminaires basés sur la norme CEI 60364.',
          source: 'default',
          createdAt: new Date().toISOString(),
        },
      ],
      loads: data.loads || [],
      calculations: {
        cableSizing: [],
        protectionRecommendations: [],
      },
    };

    const calculated = computeCalculations(newProj);
    setProjects(prev => [calculated, ...prev]);
    setCurrentProjectId(calculated.id);
    return calculated;
  }, [computeCalculations, setCurrentProjectId]);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return computeCalculations(merged);
      })
    );
  }, [computeCalculations]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const filtered = prev.filter(p => p.id !== id);
      if (currentProjectId === id) {
        setCurrentProjectId(filtered[0]?.id || null);
      }
      return filtered;
    });
  }, [currentProjectId, setCurrentProjectId]);

  const duplicateProject = useCallback((id: string): Project => {
    const orig = projects.find(p => p.id === id);
    if (!orig) throw new Error('Project not found');

    const copy: Project = {
      ...orig,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `${orig.name} (Copie)`,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
    };

    setProjects(prev => [copy, ...prev]);
    setCurrentProjectId(copy.id);
    return copy;
  }, [projects, setCurrentProjectId]);

  const addLoad = useCallback((projectId: string, loadData: Omit<ElectricalLoad, 'id'>) => {
    const newLoad: ElectricalLoad = {
      ...loadData,
      id: `load-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updated = { ...p, loads: [...p.loads, newLoad] };
        return computeCalculations(updated);
      })
    );
  }, [computeCalculations]);

  const updateLoad = useCallback((projectId: string, loadId: string, updates: Partial<ElectricalLoad>) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updatedLoads = p.loads.map(l => (l.id === loadId ? { ...l, ...updates } : l));
        return computeCalculations({ ...p, loads: updatedLoads });
      })
    );
  }, [computeCalculations]);

  const deleteLoad = useCallback((projectId: string, loadId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        const updatedLoads = p.loads.filter(l => l.id !== loadId);
        return computeCalculations({ ...p, loads: updatedLoads });
      })
    );
  }, [computeCalculations]);

  const addAssumption = useCallback((projectId: string, description: string) => {
    const asm: Assumption = {
      id: `asm-${Date.now()}`,
      description,
      source: 'user',
      createdAt: new Date().toISOString(),
    };

    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, assumptions: [...p.assumptions, asm] };
      })
    );
  }, []);

  const deleteAssumption = useCallback((projectId: string, assumptionId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return { ...p, assumptions: p.assumptions.filter(a => a.id !== assumptionId) };
      })
    );
  }, []);

  const recalculateProject = useCallback((projectId: string) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return computeCalculations(p);
      })
    );
  }, [computeCalculations]);

  const addCableCalculation = useCallback((projectId: string, input: CableSizingInput) => {
    const result = calculateCableSizing(input);
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          calculations: {
            ...p.calculations,
            cableSizing: [...p.calculations.cableSizing, result],
          },
        };
      })
    );
  }, []);

  const deleteCableCalculation = useCallback((projectId: string, index: number) => {
    setProjects(prev =>
      prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          calculations: {
            ...p.calculations,
            cableSizing: p.calculations.cableSizing.filter((_, i) => i !== index),
          },
        };
      })
    );
  }, []);

  const loadDemo = useCallback(() => {
    const demo = createDemoProject();
    setProjects(prev => [demo, ...prev.filter(p => p.id !== demo.id)]);
    setCurrentProjectId(demo.id);
  }, [setCurrentProjectId]);

  const clearAllProjects = useCallback(() => {
    setProjects([]);
    setCurrentProjectId(null);
  }, [setCurrentProjectId]);

  const value: ProjectContextType = {
    projects,
    currentProjectId,
    currentProject,
    setCurrentProjectId,
    createProject,
    updateProject,
    deleteProject,
    duplicateProject,
    addLoad,
    updateLoad,
    deleteLoad,
    addAssumption,
    deleteAssumption,
    recalculateProject,
    addCableCalculation,
    deleteCableCalculation,
    loadDemo,
    clearAllProjects,
  };

  return React.createElement(ProjectContext.Provider, { value }, children);
};

export function useProjects() {
  return useContext(ProjectContext);
}

