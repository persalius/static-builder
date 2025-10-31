export type WebcontainerFile = { file: { contents: string } };
export type WebcontainerDirectory = { directory: WebcontainerStructure };
export type WebcontainerStructure = { [name: string]: WebcontainerFile | WebcontainerDirectory };
