import { defineConfig } from 'drizzle-kit';
import config from './config.json';

export default defineConfig({
	schema: './src/database/tables/*',
	out: './drizzle',
	dialect: 'postgresql', // 'postgresql' | 'mysql' | 'sqlite'
	dbCredentials: {
		url: config.database.url,
	},
});