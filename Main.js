/*
	MIT License

	Copyright (c) 2022 Muller Castro

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.

*/

const COVER_PATH = "icons/Cover.png",
      ICONS      = [
	
	["blush"         , "icons/giphy-blush.gif"         ],
	["cake"          , "icons/giphy-cake.gif"          ],
	["chefs-kiss"    , "icons/giphy-chefs-kiss.gif"    ],
	["clap"          , "icons/giphy-clap.gif"          ],
	["coffee"        , "icons/giphy-coffee.gif"        ],
	["cool"          , "icons/giphy-cool.gif"          ],
	["eyes"          , "icons/giphy-eyes.gif"          ],
	["grimacing"     , "icons/giphy-grimacing.gif"     ],
	["grin"          , "icons/giphy-grin.gif"          ],
	["heart"         , "icons/giphy-heart.gif"         ],
	["hearts"        , "icons/giphy-hearts.gif"        ],
	["hug"           , "icons/giphy-hug.gif"           ],
	["joy"           , "icons/giphy-joy.gif"           ],
	["kiss"          , "icons/giphy-kiss.gif"          ],
	["laughing"      , "icons/giphy-laughing.gif"      ],
	["rofl"          , "icons/giphy-rofl.gif"          ],
	["sleeping"      , "icons/giphy-sleeping.gif"      ],
	["sweat-smile"   , "icons/giphy-sweat-smile.gif"   ],
	["thumbs-up"     , "icons/giphy-thumbs-up.gif"     ],
	["tongue-crossed", "icons/giphy-tongue-crossed.gif"]
	
];

const MOVE_COUNTER     = document.getElementById("move-counter"),
      MATCH_RATE       = document.getElementById("match-rate"),
      TIME_COUNTER     = document.getElementById("time-counter"),
      BOARD            = document.getElementById("board"),
      BOARD_TABLE      = document.getElementById("board-table"),
      MATCH_COLLECTION = document.getElementById("match-collection");

const DEFAULT_MOVE_COUNTER = MOVE_COUNTER.innerText,
      DEFAULT_MATCH_RATE   = MATCH_RATE  .innerText,
      DEFAULT_TIME_COUNTER = TIME_COUNTER.innerText;

const SELECTION_MARGIN = "5px";

let difficulty    = null,
    pairs_n       = 0,
    chosen        = [],
    match_counter = 0,
    timer         = 0,
    interval      = null;

function get_icon_metadata(repeated_icons) {
	
	let icon_i = Math.floor(Math.random() * ICONS.length);
	
	if(repeated_icons[ICONS[icon_i][0]]) {
		
		for(++icon_i; icon_i <= ICONS.length; ++icon_i) {
			
			if(icon_i == ICONS.length) {
				
				icon_i = -1;
				
				continue;
				
			}
			
			if(!repeated_icons[ICONS[icon_i][0]]) break;
			
		}
		
	}
	
	repeated_icons[ICONS[icon_i][0]] = true;
	
	return ICONS[icon_i];
	
}

function create_img_pair(repeated_icons) {
	
	let icon_meta = get_icon_metadata(repeated_icons),
	    img_a     = document.createElement("img"),
	    img_b     = document.createElement("img");
	
	img_a.alt = img_b.alt = ("icon-" + icon_meta[0]);
	
	img_a.id  = img_a.alt + "-a";
	img_b.id  = img_b.alt + "-b";
	
	img_a.src = img_b.src = COVER_PATH;
	
	img_a.className = img_b.className = "icon";
	
	img_a.icon_path = img_b.icon_path = icon_meta[1];
	
	img_a.draggable = img_b.draggable = false;
	
	return [img_a, img_b];
	
}

function set_flipped(b) {
	
	this.children[0].src = b ? this.children[0].icon_path : COVER_PATH;
	
	this.style.bottom = b ? SELECTION_MARGIN : null;
	
	this.flipped = b;
	
}

function stop_timer() {
	
	if(interval) {
		
		clearInterval(interval);
		
		interval = null;
		
	}
	
}

function create_timer() {
	
	interval = setInterval(() => {
		
		let minutes = Math.floor(++timer / 60),
		    seconds = timer - minutes * 60;
		
		minutes = minutes < 10 ? "0" + minutes : minutes;
		seconds = seconds < 10 ? "0" + seconds : seconds;
		
		TIME_COUNTER.innerText = minutes + ":" + seconds;
		
		if(timer > 5998) stop_timer();
		
	}, 1000);
	
}

function finish_game() {
	
	stop_timer();
	
	TIME_COUNTER.style.animation = "resize 2.0s ease-in-out infinite";
	
}

function evaluate_cards() {
	
	if(chosen.length == 2) {
		
		if(chosen[0].alt == chosen[1].alt) {
			
			let icon = chosen[0].children[0];
			
			chosen[0].removeChild(icon);
			chosen[1].children[0].remove();
			
			icon.className = "collected-icon";
			MATCH_COLLECTION.appendChild(icon);
			
			chosen[0].onclick = chosen[1].onclick = null;
			
			if(++match_counter == pairs_n) finish_game();
			
		}else {
			
			chosen[0].set_flipped(false);
			chosen[1].set_flipped(false);
			
		}
		
		chosen = [];
		
		MATCH_RATE.innerText = (match_counter / ++MOVE_COUNTER.innerText * 100.0).toFixed(0) + "%";
		
		return true;
		
	}
	
	return false;
	
}

function click_card() {
	
	if(!interval) create_timer();
	
	if(evaluate_cards() || this.flipped) return;
	
	chosen.push(this);
	
	this.set_flipped(true);
	
}

function create_card_pair(repeated_icons) {
	
	let card_a       = document.createElement("div"),
	    card_b       = document.createElement("div"),
	    new_img_pair = create_img_pair(repeated_icons);
	
	card_a.alt = card_b.alt = ("card-" + new_img_pair[0].alt);
	
	card_a.id = card_a.alt + "-a";
	card_b.id = card_b.alt + "-b";
	
	card_a.appendChild(new_img_pair[0]);
	card_b.appendChild(new_img_pair[1]);
	
	card_a.className   = card_b.className   = "card";
	card_a.onclick     = card_b.onclick     = click_card;
	card_a.flipped     = card_b.flipped     = false;
	card_a.set_flipped = card_b.set_flipped = set_flipped;
	
	return [card_a, card_b];
	
}

function create_board(width, height) {
	
	let repeated_icons = {},
	    cards          = [];
	
	for(let i = 0; i < pairs_n; ++i) {
		
		let new_pair = create_card_pair(repeated_icons);
		
		cards.push(new_pair[0]);
		cards.push(new_pair[1]);
		
	}
	
	cards.sort(() => Math.random() - 0.5); // shuffles the array
	
	let img_i = 0;
	
	for(let y = 0; y < height; ++y) {
		
		let new_row = BOARD_TABLE.appendChild(document.createElement('tr'));
		
		for(let x = 0; x < width; ++x) {
			
			let new_cell = document.createElement('td');
			
			new_row.appendChild(new_cell);
			
			new_cell.appendChild(cards[img_i++]);
			
		}
		
	}
	
}

function clear_game_settings() {
	
	MOVE_COUNTER.innerText       = DEFAULT_MOVE_COUNTER;
	MATCH_RATE.innerText         = DEFAULT_MATCH_RATE;
	TIME_COUNTER.innerText       = DEFAULT_TIME_COUNTER;
	TIME_COUNTER.style.animation = null;
	pairs_n                      = 0;
	chosen                       = [];
	match_counter                = 0;
	timer                        = 0;
	
	stop_timer();
	
	for(let child of [...BOARD_TABLE.childNodes, ...MATCH_COLLECTION.childNodes]) child.remove();
	
}

function reset_game(new_difficulty) {
	
	difficulty = new_difficulty;
	
	clear_game_settings();
	
	if(difficulty == "E") {
		
		pairs_n = 6;
		
		BOARD.style.width  = "501px";
		BOARD.style.height = "381px";
		
		create_board(4, 3);
		
	}else if(difficulty == "M") {
		
		pairs_n = 12;
		
		BOARD.style.width  = "741px";
		BOARD.style.height = "501px";
		
		create_board(6, 4);
		
	}else if(difficulty == "H") {
		
		pairs_n = 20;
		
		BOARD.style.width  = "981px";
		BOARD.style.height = "621px";
		
		create_board(8, 5);
		
	}else {
		
		throw "Unknown difficulty";
		
	}
	
}

try {
	
	reset_game("E");
	
}catch(err) {
	
	clear_game_settings();
	
	throw err;
	
}
