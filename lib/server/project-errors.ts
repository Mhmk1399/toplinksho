export class ProjectError extends Error {
  constructor(message: string, public status = 422, public fields?: Record<string, string>) { super(message); }
}
