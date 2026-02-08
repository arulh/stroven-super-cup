CREATE TABLE players (
	id INTEGER NOT NULL, 
	name VARCHAR(80) NOT NULL, 
	handle VARCHAR(64) NOT NULL, 
	current_elo FLOAT NOT NULL, 
	matches_played INTEGER NOT NULL, 
	wins INTEGER NOT NULL, 
	losses INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (handle)
);
CREATE TABLE api_keys (
	key_id VARCHAR(64) NOT NULL, 
	label VARCHAR(80) NOT NULL, 
	public_key_b64 TEXT NOT NULL, 
	can_write BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	revoked_at DATETIME, 
	PRIMARY KEY (key_id)
);
CREATE TABLE nonces (
	nonce VARCHAR(64) NOT NULL, 
	created_at DATETIME NOT NULL, 
	expires_at DATETIME NOT NULL, 
	PRIMARY KEY (nonce)
);
CREATE TABLE audits (
	id INTEGER NOT NULL, 
	ts DATETIME NOT NULL, 
	key_id VARCHAR(64), 
	action VARCHAR(32) NOT NULL, 
	resource_type VARCHAR(32), 
	resource_id VARCHAR(64), 
	ip VARCHAR(64), 
	user_agent TEXT, 
	signature_valid BOOLEAN NOT NULL, 
	note TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT audit_id_unique UNIQUE (id)
);
CREATE TABLE matches (
	id INTEGER NOT NULL, 
	played_at DATETIME NOT NULL, 
	p1_id INTEGER NOT NULL, 
	p2_id INTEGER NOT NULL, 
	p1_score INTEGER NOT NULL, 
	p2_score INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	created_by_key_id VARCHAR(64) NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(p1_id) REFERENCES players (id), 
	FOREIGN KEY(p2_id) REFERENCES players (id)
);
CREATE TABLE rating_history (
	id INTEGER NOT NULL, 
	player_id INTEGER NOT NULL, 
	match_id INTEGER NOT NULL, 
	pre_elo FLOAT NOT NULL, 
	post_elo FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(player_id) REFERENCES players (id), 
	FOREIGN KEY(match_id) REFERENCES matches (id)
);
