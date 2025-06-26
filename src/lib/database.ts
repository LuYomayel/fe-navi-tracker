// Archivo temporal para reemplazar database.ts mientras se arreglan los tipos
// TODO: Arreglar los tipos de Prisma y restaurar database.ts

export const activityService = {
  async getAll() {
    return [];
  },
  async create() {
    return null;
  },
  async update() {
    return null;
  },
  async delete() {
    return false;
  },
};

export const completionService = {
  async getAll() {
    return [];
  },
  async toggle() {
    return null;
  },
  async getForActivity() {
    return [];
  },
};

export const noteService = {
  async get() {
    return null;
  },
  async upsert() {
    return null;
  },
  async delete() {
    return false;
  },
};

export const preferencesService = {
  async get() {
    return null;
  },
  async create() {
    return null;
  },
  async update() {
    return null;
  },
};

export const nutritionService = {
  async getAll() {
    return [];
  },
  async getByDate() {
    return [];
  },
  async create() {
    return null;
  },
  async delete() {
    return false;
  },
};

export const bodyAnalysisService = {
  async getAll() {
    return [];
  },
  async create() {
    return null;
  },
  async getLatest() {
    return null;
  },
  async delete() {
    return false;
  },
};

export const aiSuggestionService = {
  async getAll() {
    return [];
  },
  async create() {
    return null;
  },
  async dismiss() {
    return false;
  },
  async getActive() {
    return [];
  },
};

export const chatService = {
  async getAll() {
    return [];
  },
  async create() {
    return null;
  },
  async clear() {
    return false;
  },
};

export const analysisService = {
  async getAll() {
    return [];
  },
  async create() {
    return null;
  },
  async getRecent() {
    return [];
  },
};
