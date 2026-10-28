-- Переводы урока: { "kk": { title, description, exercises: [...] }, "en": { ... } }
ALTER TABLE "Lesson" ADD COLUMN "translations" JSONB;
