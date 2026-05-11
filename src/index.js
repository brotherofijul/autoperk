#!/usr/bin/env node

// src/index.js

import fs from "node:fs";
import path from "node:path";
import fastify from "fastify";
import { DatabaseSync } from "node:sqlite";
import { gotScraping } from "got-scraping";
import UserAgent from "user-agents";

const userAgent = new UserAgent({
	deviceCategory: "mobile"
});

const args = process.argv.slice(2);

const DATABASE_PATH = path.resolve("./autoperk.db");
const SERVER_PORT = 3000;

const AUTO_PERK_INTERVAL = 60_000;

const DEFAULT_HEADERS = {
	"User-Agent": userAgent.toString()
};

const PERKS = {
	str: {
		id: 1,
		name: "Strength"
	},
	edu: {
		id: 2,
		name: "Education"
	},
	end: {
		id: 3,
		name: "Endurance"
	}
};

const PAYMENTS = {
	m: {
		id: 1,
		name: "Money"
	},
	g: {
		id: 2,
		name: "Gold"
	}
};

initializeDatabase();

const db = new DatabaseSync(DATABASE_PATH);

db.exec(`
	CREATE TABLE IF NOT EXISTS accounts (
		id INTEGER PRIMARY KEY,
		cookie TEXT NOT NULL,
		c_html TEXT,
		timestamp TEXT
	);
`);

const app = fastify({
	logger: false
});

const insertAccountStatement = db.prepare(`
	INSERT INTO accounts (
		id,
		cookie,
		c_html,
		timestamp
	)
	VALUES (?, ?, ?, ?)
	ON CONFLICT(id) DO UPDATE SET
		cookie = excluded.cookie,
		c_html = excluded.c_html,
		timestamp = excluded.timestamp
`);

const selectAccountStatement = db.prepare(`
	SELECT *
	FROM accounts
	WHERE id = ?
`);

const selectAllAccountsStatement = db.prepare(`
	SELECT *
	FROM accounts
	ORDER BY id ASC
`);

app.post("/autoperk/add", async (request) => {
	try {
		const { cookie, timestamp } = request.body || {};

		if (!cookie) {
			return {
				success: false,
				message: "Cookie tidak ada"
			};
		}

		const account = await fetchAccountData(cookie);

		insertAccountStatement.run(
			account.id,
			cookie,
			account.c_html,
			timestamp || null
		);

		console.log("\n=== Session Updated ===");
		console.log("Player ID :", account.id);
		console.log("Timestamp :", timestamp || "-");
		console.log("──────────────────────────────");

		return {
			success: true,
			playerId: account.id,
			c_html: account.c_html,
			message: "Akun berhasil diproses"
		};
	} catch (error) {
		return {
			success: false,
			message: error.message
		};
	}
});

app.get("/autoperk/accountlist", async () => {
	try {
		const accounts = selectAllAccountsStatement.all();

		return {
			success: true,
			total: accounts.length,
			accounts
		};
	} catch (error) {
		return {
			success: false,
			message: error.message
		};
	}
});

function initializeDatabase() {
	const directory = path.dirname(DATABASE_PATH);

	if (!fs.existsSync(directory)) {
		fs.mkdirSync(directory, {
			recursive: true
		});
	}
}

async function fetchAccountData(cookie) {
	const response = await gotScraping({
		url: "https://m.rivalregions.com/",
		headers: {
			...DEFAULT_HEADERS,
			cookie
		}
	});

	const html = response.body;

	const idMatch = html.match(/var\s+id\s*=\s*(\d+);/);

	const cHtmlMatch = html.match(
		/var\s+c_html\s*=\s*['"]([^'"]+)['"]/
	);

	if (!idMatch) {
		throw new Error("Gagal mendapatkan player ID");
	}

	if (!cHtmlMatch) {
		throw new Error("Gagal mendapatkan c_html");
	}

	return {
		id: Number(idMatch[1]),
		c_html: cHtmlMatch[1]
	};
}

function formatTimestamp(date = new Date()) {
	return (
		[
			String(date.getDate()).padStart(2, "0"),
			String(date.getMonth() + 1).padStart(2, "0"),
			date.getFullYear()
		].join("/") +
		" " +
		[
			String(date.getHours()).padStart(2, "0"),
			String(date.getMinutes()).padStart(2, "0")
		].join(":")
	);
}

function showHelp() {
	console.log(`
AutoPerk CLI

Usage:
  autoperk -SV
  autoperk -AL
  autoperk -S <id> <str|edu|end> <m|g>
  autoperk -H

Commands:
  -SV, --server
      Menjalankan Fastify server

  -AL, --account-list
      Menampilkan daftar akun

  -S, --start
      Menjalankan auto perk

      Example:
      autoperk -S 123456 str m

  -H, --help
      Menampilkan bantuan
	`);
}

async function startServer() {
	try {
		await app.listen({
			port: SERVER_PORT
		});

		console.log(`Server running on port ${SERVER_PORT}`);
	} catch (error) {
		console.error("Server error:", error.message);

		process.exit(1);
	}
}

function showAccountList() {
	try {
		const accounts = selectAllAccountsStatement.all();

		if (!accounts.length) {
			console.log("Tidak ada akun tersimpan.");

			return;
		}

		console.log("\n=== Account List ===\n");

		for (const account of accounts) {
			console.log(`ID        : ${account.id}`);
			console.log(`Cookie    : ${account.cookie}`);
			console.log(`c_html    : ${account.c_html}`);
			console.log(`Timestamp : ${account.timestamp}`);
			console.log("──────────────────────────────");
		}

		console.log(`\nTotal Account: ${accounts.length}\n`);
	} catch (error) {
		console.error(
			"Gagal mengambil account list:",
			error.message
		);
	}
}

async function executePerk(account, perk, payment) {
	const response = await gotScraping({
		url: `https://m.rivalregions.com/perks/up/${perk.id}/${payment.id}`,
		method: "POST",
		headers: {
			...DEFAULT_HEADERS,
			cookie: account.cookie,
			"x-requested-with": "XMLHttpRequest",
			"content-type":
				"application/x-www-form-urlencoded; charset=UTF-8"
		},
		body: `c=${encodeURIComponent(account.c_html)}`
	});
	
	if (response.body && response.body.trim().length > 0) {
		console.log(`[${formatTimestamp()}] upgraded | ${perk.name} | ${payment.name}`);
	}
}

async function startAutoPerk(id, perkKey, paymentKey) {
	const perk = PERKS[perkKey];
	const payment = PAYMENTS[paymentKey];

	if (!perk) {
		console.error("Perk invalid.");

		process.exit(1);
	}

	if (!payment) {
		console.error("Payment invalid.");

		process.exit(1);
	}

	const account = selectAccountStatement.get(id);

	if (!account) {
		console.error("Account tidak ditemukan.");

		process.exit(1);
	}

	console.log("\n=== Auto Perk Started ===");
	console.log("Player ID :", account.id);
	console.log("Perk      :", perk.name);
	console.log("Payment   :", payment.name);
	console.log("Interval  : 1 Minute");
	console.log("──────────────────────────────");

	const run = async () => {
		try {
			await executePerk(account, perk, payment);
		} catch (error) {
			console.error(
				`[${formatTimestamp()}] Failed | ${error.message}`
			);
		}
	};

	await run();

	setInterval(run, AUTO_PERK_INTERVAL);
}

async function main() {
	if (args.includes("--server") || args.includes("-SV")) {
		return startServer();
	}

	if (args.includes("--account-list") || args.includes("-AL")) {
		return showAccountList();
	}

	if (args.includes("--start") || args.includes("-S")) {
		const id = Number(args[1]);
		const perk = args[2];
		const payment = args[3];

		if (!id || !perk || !payment) {
			console.error(`
Format salah!

Format:
  autoperk -S <id> <str|edu|end> <m|g>

Example:
  autoperk -S 123456 str m
			`);

			process.exit(1);
		}

		return startAutoPerk(id, perk, payment);
	}

	if (args.includes("--help") || args.includes("-H")) {
		return showHelp();
	}

	console.log("Argumen tidak valid. Gunakan -H untuk bantuan.");

	process.exit(1);
}

main();
