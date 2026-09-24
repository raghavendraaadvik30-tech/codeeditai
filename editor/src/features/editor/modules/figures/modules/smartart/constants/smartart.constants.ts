import type { SmartArtCategory, SmartArtLayoutConfig, SmartArtColorScheme } from '../types/smartart.types';

export const SMARTART_CATEGORIES: { id: SmartArtCategory; label: string; description: string }[] = [
  {
    id: 'List',
    label: 'List',
    description: 'Use to show non-sequential or grouped blocks of information.',
  },
  {
    id: 'Process',
    label: 'Process',
    description: 'Use to show progression or sequential steps in a process, workflow, or timeline.',
  },
  {
    id: 'Cycle',
    label: 'Cycle',
    description: 'Use to represent a continuing sequence of stages, tasks, or events in a circular flow.',
  },
  {
    id: 'Hierarchy',
    label: 'Hierarchy',
    description: 'Use to show hierarchical relationships or reporting structures in an organization.',
  },
  {
    id: 'Matrix',
    label: 'Matrix',
    description: 'Use to show the relationship of components to a whole in quadrants or multidimensional grids.',
  },
  {
    id: 'Pyramid',
    label: 'Pyramid',
    description: 'Use to show proportional, interconnected, or foundation-based relationships with a hierarchical top.',
  },
  {
    id: 'Text Card',
    label: 'Text Card',
    description: 'Use to present key ideas, callouts, cards, or metric statistics with rich typography.',
  },
];

export const SMARTART_COLOR_SCHEMES: SmartArtColorScheme[] = [
  {
    id: 'colorful',
    name: 'Colorful Palette',
    colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'],
  },
  {
    id: 'blue',
    name: 'Office Blue',
    colors: ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    colors: ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
  },
  {
    id: 'purple',
    name: 'Royal Violet',
    colors: ['#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    colors: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'],
  },
  {
    id: 'slate',
    name: 'Monochrome Slate',
    colors: ['#1e293b', '#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
  },
];

export const SMARTART_LAYOUTS: Record<SmartArtCategory, SmartArtLayoutConfig[]> = {
  List: [
    {
      id: 'basicList',
      name: 'Basic List',
      category: 'List',
      description: 'Use to display non-sequential blocks of information. Maximizes horizontal and vertical space for multiple points.',
      defaultNodes: [
        { id: 'node-1', text: 'First Point', subtitle: 'Detailed description for the first item' },
        { id: 'node-2', text: 'Second Point', subtitle: 'Detailed description for the second item' },
        { id: 'node-3', text: 'Third Point', subtitle: 'Detailed description for the third item' },
        { id: 'node-4', text: 'Fourth Point', subtitle: 'Detailed description for the fourth item' },
      ],
    },
    {
      id: 'verticalList',
      name: 'Vertical List',
      category: 'List',
      description: 'Use to display a sequential column of numbered or badge-accented list items.',
      defaultNodes: [
        { id: 'node-1', text: 'Preparation Phase', subtitle: 'Initial setup and resource allocation' },
        { id: 'node-2', text: 'Execution Strategy', subtitle: 'Core implementation tasks' },
        { id: 'node-3', text: 'Verification & Review', subtitle: 'Quality assurance and auditing' },
      ],
    },
    {
      id: 'horizontalList',
      name: 'Horizontal List',
      category: 'List',
      description: 'Use to compare parallel concepts or items side-by-side in equal-width modern cards.',
      defaultNodes: [
        { id: 'node-1', text: 'Concept A', subtitle: 'Key properties and advantages' },
        { id: 'node-2', text: 'Concept B', subtitle: 'Core functionality and scope' },
        { id: 'node-3', text: 'Concept C', subtitle: 'Operational impact and results' },
      ],
    },
    {
      id: 'groupedList',
      name: 'Grouped List',
      category: 'List',
      description: 'Use to show groups of related items categorized under clear visual headings.',
      defaultNodes: [
        { id: 'node-1', text: 'Primary Category', subtitle: 'Primary sub-item 1 • Sub-item 2' },
        { id: 'node-2', text: 'Secondary Category', subtitle: 'Supporting sub-item 1 • Sub-item 2' },
        { id: 'node-3', text: 'Tertiary Category', subtitle: 'Auxiliary sub-item 1 • Sub-item 2' },
      ],
    },
    {
      id: 'stackedList',
      name: 'Stacked List',
      category: 'List',
      description: 'Use to show layered concepts with strong visual hierarchy and colorful accent edges.',
      defaultNodes: [
        { id: 'node-1', text: 'Foundational Layer', subtitle: 'Underlying infrastructure' },
        { id: 'node-2', text: 'Application Logic', subtitle: 'Core processing components' },
        { id: 'node-3', text: 'User Experience', subtitle: 'Visual interface and touchpoints' },
      ],
    },
    {
      id: 'numberedList',
      name: 'Numbered List',
      category: 'List',
      description: 'Use to present a prioritized order of items accented by prominent circular number badges.',
      defaultNodes: [
        { id: 'node-1', text: 'First Priority', subtitle: 'Immediate urgent deliverables' },
        { id: 'node-2', text: 'Second Priority', subtitle: 'Mid-term milestone targets' },
        { id: 'node-3', text: 'Third Priority', subtitle: 'Long-term strategic roadmap' },
      ],
    },
  ],

  Process: [
    {
      id: 'basicProcess',
      name: 'Basic Process',
      category: 'Process',
      description: 'Use to show a progression or sequential steps in a task, process, or workflow with directional arrows.',
      defaultNodes: [
        { id: 'node-1', text: 'Step 1', subtitle: 'Initial phase' },
        { id: 'node-2', text: 'Step 2', subtitle: 'Intermediate phase' },
        { id: 'node-3', text: 'Step 3', subtitle: 'Final phase' },
      ],
    },
    {
      id: 'basicBlockProcess',
      name: 'Basic Block Process',
      category: 'Process',
      description: 'Use to show a progression or sequential steps in a process using connected block shapes.',
      defaultNodes: [
        { id: 'node-1', text: 'Step 1', subtitle: 'Initiation' },
        { id: 'node-2', text: 'Step 2', subtitle: 'Execution' },
        { id: 'node-3', text: 'Step 3', subtitle: 'Completion' },
      ],
    },
    {
      id: 'stepDownProcess',
      name: 'Step Down Process',
      category: 'Process',
      description: 'Use to show a descending process with multiple steps and sub-steps.',
      defaultNodes: [
        { id: 'node-1', text: 'Step 1', subtitle: 'Top tier planning' },
        { id: 'node-2', text: 'Step 2', subtitle: 'Mid tier development' },
        { id: 'node-3', text: 'Step 3', subtitle: 'Base tier deployment' },
      ],
    },
    {
      id: 'continuousProcess',
      name: 'Continuous Process',
      category: 'Process',
      description: 'Use to show a continuous timeline or ongoing sequence of steps.',
      defaultNodes: [
        { id: 'node-1', text: 'Phase 1', subtitle: 'Analysis' },
        { id: 'node-2', text: 'Phase 2', subtitle: 'Design' },
        { id: 'node-3', text: 'Phase 3', subtitle: 'Implementation' },
        { id: 'node-4', text: 'Phase 4', subtitle: 'Review' },
      ],
    },
    {
      id: 'chevronProcess',
      name: 'Chevron Process',
      category: 'Process',
      description: 'Use to show a progression or sequential steps in a process with chevron directional arrows.',
      defaultNodes: [
        { id: 'node-1', text: 'Step 1' },
        { id: 'node-2', text: 'Step 2' },
        { id: 'node-3', text: 'Step 3' },
      ],
    },
    {
      id: 'verticalProcess',
      name: 'Vertical Process',
      category: 'Process',
      description: 'Use to show a progression of steps moving top-to-bottom vertically.',
      defaultNodes: [
        { id: 'node-1', text: 'Start', subtitle: 'Kickoff meeting' },
        { id: 'node-2', text: 'Process', subtitle: 'Build and refine' },
        { id: 'node-3', text: 'Finish', subtitle: 'Final delivery' },
      ],
    },
    {
      id: 'alternatingProcess',
      name: 'Alternating Process',
      category: 'Process',
      description: 'Use to show a sequence of steps alternating across a central axis line.',
      defaultNodes: [
        { id: 'node-1', text: 'Milestone 1', subtitle: 'Q1 Launch' },
        { id: 'node-2', text: 'Milestone 2', subtitle: 'Q2 Growth' },
        { id: 'node-3', text: 'Milestone 3', subtitle: 'Q3 Expansion' },
        { id: 'node-4', text: 'Milestone 4', subtitle: 'Q4 Optimization' },
      ],
    },
    {
      id: 'circleProcess',
      name: 'Circle Process',
      category: 'Process',
      description: 'Use to show a linear sequence of circular step nodes progressing toward a final milestone.',
      defaultNodes: [
        { id: 'node-1', text: 'Stage 1' },
        { id: 'node-2', text: 'Stage 2' },
        { id: 'node-3', text: 'Stage 3' },
      ],
    },
  ],

  Cycle: [
    {
      id: 'basicCycle',
      name: 'Basic Cycle',
      category: 'Cycle',
      description: 'Use to represent a continuous sequence of 5 stages, tasks, or events in a circular flow. Emphasizes the stages rather than connecting arrows.',
      defaultNodes: [
        { id: 'node-1', text: 'Stage 1' },
        { id: 'node-2', text: 'Stage 2' },
        { id: 'node-3', text: 'Stage 3' },
        { id: 'node-4', text: 'Stage 4' },
        { id: 'node-5', text: 'Stage 5' },
      ],
    },
    {
      id: 'continuousCycle',
      name: 'Continuous Cycle',
      category: 'Cycle',
      description: 'Use to show a continuing sequence of stages or events in an ongoing circular process loop.',
      defaultNodes: [
        { id: 'node-1', text: 'Plan' },
        { id: 'node-2', text: 'Develop' },
        { id: 'node-3', text: 'Test' },
        { id: 'node-4', text: 'Deploy' },
      ],
    },
    {
      id: 'radialCycle',
      name: 'Radial Cycle',
      category: 'Cycle',
      description: 'Use to show the relationship to a central idea in a cycle. The first node serves as the central hub.',
      defaultNodes: [
        { id: 'node-1', text: 'Core Mission', level: 0 },
        { id: 'node-2', text: 'Strategy', level: 1 },
        { id: 'node-3', text: 'Design', level: 1 },
        { id: 'node-4', text: 'Innovation', level: 1 },
        { id: 'node-5', text: 'Execution', level: 1 },
      ],
    },
    {
      id: 'segmentedCycle',
      name: 'Segmented Cycle',
      category: 'Cycle',
      description: 'Use to show a progression or sequence of stages in a circular segmented layout with proportional arcs.',
      defaultNodes: [
        { id: 'node-1', text: 'Phase 1: Discovery' },
        { id: 'node-2', text: 'Phase 2: Architecture' },
        { id: 'node-3', text: 'Phase 3: Launch' },
      ],
    },
    {
      id: 'circularCycle',
      name: 'Circular Cycle',
      category: 'Cycle',
      description: 'Use to show how parts relate to a whole in a circular flow with step-by-step directional indicators.',
      defaultNodes: [
        { id: 'node-1', text: 'Assess' },
        { id: 'node-2', text: 'Implement' },
        { id: 'node-3', text: 'Measure' },
        { id: 'node-4', text: 'Optimize' },
      ],
    },
  ],

  Hierarchy: [
    {
      id: 'basicHierarchy',
      name: 'Basic Hierarchy',
      category: 'Hierarchy',
      description: 'Use to show hierarchical relationships progressing from top to bottom. Useful for organizational structures and trees.',
      defaultNodes: [
        { id: 'node-1', text: 'Top Level', level: 1 },
        { id: 'node-2', text: 'Sub-Level A', level: 2 },
        { id: 'node-3', text: 'Sub-Level B', level: 2 },
        { id: 'node-4', text: 'Sub-Level C', level: 2 },
      ],
    },
    {
      id: 'horizontalHierarchy',
      name: 'Horizontal Hierarchy',
      category: 'Hierarchy',
      description: 'Use to show a tree structure progressing from left to right. Ideal for decision trees and horizontal flow hierarchies.',
      defaultNodes: [
        { id: 'node-1', text: 'Parent Origin', level: 1 },
        { id: 'node-2', text: 'Branch 1', level: 2 },
        { id: 'node-3', text: 'Branch 2', level: 2 },
        { id: 'node-4', text: 'Branch 3', level: 2 },
      ],
    },
    {
      id: 'labeledHierarchy',
      name: 'Labeled Hierarchy',
      category: 'Hierarchy',
      description: 'Use to show multi-level hierarchy with explicit tier headers and categorized subordinate items.',
      defaultNodes: [
        { id: 'node-1', text: 'Executive Leadership', subtitle: 'Tier 1 Governance', level: 1 },
        { id: 'node-2', text: 'Product Division', subtitle: 'Tier 2 Management', level: 2 },
        { id: 'node-3', text: 'Engineering Operations', subtitle: 'Tier 2 Management', level: 2 },
      ],
    },
    {
      id: 'organizationHierarchy',
      name: 'Organization Hierarchy',
      category: 'Hierarchy',
      description: 'Use to show organizational reporting relationships with distinct executive and direct report cards.',
      defaultNodes: [
        { id: 'node-1', text: 'Director / Lead', subtitle: 'Head of Department', level: 1 },
        { id: 'node-2', text: 'Team Lead Alpha', subtitle: 'Core Systems', level: 2 },
        { id: 'node-3', text: 'Team Lead Beta', subtitle: 'User Experience', level: 2 },
        { id: 'node-4', text: 'Team Lead Gamma', subtitle: 'Quality & Delivery', level: 2 },
      ],
    },
    {
      id: 'multiLevelHierarchy',
      name: 'Multi-Level Hierarchy',
      category: 'Hierarchy',
      description: 'Use to show a three-tiered taxonomy or deep multi-level relationship breakdown.',
      defaultNodes: [
        { id: 'node-1', text: 'Enterprise Root', level: 1 },
        { id: 'node-2', text: 'Operations Unit', level: 2 },
        { id: 'node-3', text: 'Technology Unit', level: 2 },
        { id: 'node-4', text: 'Dev Team', level: 3 },
        { id: 'node-5', text: 'Ops Team', level: 3 },
      ],
    },
  ],

  Matrix: [
    {
      id: 'basicMatrix',
      name: 'Basic Matrix',
      category: 'Matrix',
      description: 'Use to show the relationship of 4 components to a whole. The first 4 lines of text correspond to the quadrants.',
      defaultNodes: [
        { id: 'node-1', text: 'Quadrant 1', subtitle: 'High Urgency / High Impact' },
        { id: 'node-2', text: 'Quadrant 2', subtitle: 'Low Urgency / High Impact' },
        { id: 'node-3', text: 'Quadrant 3', subtitle: 'High Urgency / Low Impact' },
        { id: 'node-4', text: 'Quadrant 4', subtitle: 'Low Urgency / Low Impact' },
      ],
    },
    {
      id: 'gridMatrix',
      name: 'Grid Matrix',
      category: 'Matrix',
      description: 'Use to show four quadrants positioned in a 2x2 grid with modern contrast block styling.',
      defaultNodes: [
        { id: 'node-1', text: 'Strengths', subtitle: 'Internal capabilities' },
        { id: 'node-2', text: 'Weaknesses', subtitle: 'Internal limitations' },
        { id: 'node-3', text: 'Opportunities', subtitle: 'External market growth' },
        { id: 'node-4', text: 'Threats', subtitle: 'External competitive risks' },
      ],
    },
    {
      id: 'titledMatrix',
      name: 'Titled Matrix',
      category: 'Matrix',
      description: 'Use to emphasize titled quadrants with bold colored header strips and detailed descriptions.',
      defaultNodes: [
        { id: 'node-1', text: 'Strategic Goals', subtitle: 'Long-range organizational vision' },
        { id: 'node-2', text: 'Operational Plans', subtitle: 'Day-to-day execution standards' },
        { id: 'node-3', text: 'Resource Metrics', subtitle: 'Budget, tools, and staffing' },
        { id: 'node-4', text: 'Performance KPIs', subtitle: 'Quality, uptime, and satisfaction' },
      ],
    },
    {
      id: 'fourQuadrantMatrix',
      name: 'Four-Quadrant Matrix',
      category: 'Matrix',
      description: 'Use to display items distributed across intersecting horizontal and vertical axes (e.g. Effort vs Value).',
      defaultNodes: [
        { id: 'node-1', text: 'Quick Wins', subtitle: 'Low effort, high value' },
        { id: 'node-2', text: 'Major Projects', subtitle: 'High effort, high value' },
        { id: 'node-3', text: 'Fill-Ins', subtitle: 'Low effort, low value' },
        { id: 'node-4', text: 'Thankless Tasks', subtitle: 'High effort, low value' },
      ],
    },
    {
      id: 'cycleMatrix',
      name: 'Cycle Matrix',
      category: 'Matrix',
      description: 'Use to show the relationship to a whole progressing circularly through 4 interconnected quadrant cells.',
      defaultNodes: [
        { id: 'node-1', text: 'Input', subtitle: 'Raw data collection' },
        { id: 'node-2', text: 'Process', subtitle: 'Algorithmic transformation' },
        { id: 'node-3', text: 'Output', subtitle: 'Insight generation' },
        { id: 'node-4', text: 'Feedback', subtitle: 'Continuous adaptation' },
      ],
    },
  ],

  Pyramid: [
    {
      id: 'basicPyramid',
      name: 'Basic Pyramid',
      category: 'Pyramid',
      description: 'Use to show proportional, interconnected, or foundation-based relationships with a hierarchical top.',
      defaultNodes: [
        { id: 'node-1', text: 'Top Level', subtitle: 'Peak Vision / Executive Strategy' },
        { id: 'node-2', text: 'Middle Level', subtitle: 'Operational Tactics & Execution' },
        { id: 'node-3', text: 'Base Level', subtitle: 'Foundational Infrastructure & Data' },
      ],
    },
    {
      id: 'segmentedPyramid',
      name: 'Segmented Pyramid',
      category: 'Pyramid',
      description: 'Use to show tiered levels separated by clean spacing, emphasizing distinct layer boundaries.',
      defaultNodes: [
        { id: 'node-1', text: 'Tier 1: Leadership' },
        { id: 'node-2', text: 'Tier 2: Management' },
        { id: 'node-3', text: 'Tier 3: Specialists' },
        { id: 'node-4', text: 'Tier 4: Operations' },
      ],
    },
    {
      id: 'pyramidList',
      name: 'Pyramid List',
      category: 'Pyramid',
      description: 'Use to show pyramid tiers linked directly to detailed callout descriptions beside each level.',
      defaultNodes: [
        { id: 'node-1', text: 'Pinnacle', subtitle: 'Market leadership and brand advocacy' },
        { id: 'node-2', text: 'Advancement', subtitle: 'Customer retention and loyalty programs' },
        { id: 'node-3', text: 'Acquisition', subtitle: 'Broad reach and initial brand awareness' },
      ],
    },
    {
      id: 'layeredPyramid',
      name: 'Layered Pyramid',
      category: 'Pyramid',
      description: 'Use to show stacked horizontal trapezoids building upwards from a wide base to a focused apex.',
      defaultNodes: [
        { id: 'node-1', text: 'Apex Strategy' },
        { id: 'node-2', text: 'Functional Process' },
        { id: 'node-3', text: 'Team Capabilities' },
        { id: 'node-4', text: 'Core Architecture' },
      ],
    },
  ],

  'Text Card': [
    {
      id: 'standardCards',
      name: 'Standard Cards',
      category: 'Text Card',
      description: 'Use to display modern, responsive text cards with vibrant colored top border accents.',
      defaultNodes: [
        { id: 'node-1', text: 'Feature One', subtitle: 'High-performance processing with real-time feedback' },
        { id: 'node-2', text: 'Feature Two', subtitle: 'Zero-configuration modular design for teams' },
        { id: 'node-3', text: 'Feature Three', subtitle: 'Automated document consistency verification' },
      ],
    },
    {
      id: 'headerCards',
      name: 'Header Cards',
      category: 'Text Card',
      description: 'Use to show cards with bold solid color header ribbons and contrasting text body containers.',
      defaultNodes: [
        { id: 'node-1', text: 'Starter Plan', subtitle: 'Ideal for individuals and prototype documents' },
        { id: 'node-2', text: 'Professional', subtitle: 'Advanced collaborative authoring tools' },
        { id: 'node-3', text: 'Enterprise', subtitle: 'Custom compliance and dedicated governance' },
      ],
    },
    {
      id: 'multiColumnCards',
      name: 'Multi-Column Cards',
      category: 'Text Card',
      description: 'Use to organize multi-topic comparisons in balanced, card-based column layouts.',
      defaultNodes: [
        { id: 'node-1', text: 'Option Alpha', subtitle: 'Fast deployment, lower resource requirements' },
        { id: 'node-2', text: 'Option Beta', subtitle: 'Balanced scalability and comprehensive toolsets' },
        { id: 'node-3', text: 'Option Gamma', subtitle: 'Maximum throughput and full customization' },
      ],
    },
    {
      id: 'calloutCard',
      name: 'Callout Card',
      category: 'Text Card',
      description: 'Use to highlight a critical message, executive quote, or key takeaway in an emphasized container.',
      defaultNodes: [
        { id: 'node-1', text: 'Key Takeaway', subtitle: 'SmartArt turns complex lists and relationships into polished, memorable graphics with zero manual positioning.' },
      ],
    },
    {
      id: 'statCard',
      name: 'Stat Card',
      category: 'Text Card',
      description: 'Use to showcase key metrics, statistics, and numeric highlights with descriptive captions.',
      defaultNodes: [
        { id: 'node-1', text: '99.9%', subtitle: 'Document Reliability' },
        { id: 'node-2', text: '10x', subtitle: 'Faster Diagram Creation' },
        { id: 'node-3', text: '100%', subtitle: 'Inline Editable Nodes' },
      ],
    },
  ],
};

export const ALL_SMARTART_LAYOUTS: SmartArtLayoutConfig[] = Object.values(SMARTART_LAYOUTS).flat();
