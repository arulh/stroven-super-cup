#!/bin/bash

# Fixed timestamp for all games (you can randomize or adjust if needed)
PLAYED_AT="2025-08-17T19:30:00Z"

# Iterate over the game list
games=(
    "niko daniel 6 2"
    "arul joel 5 3"
    "niko joel 5 2"
    "arul daniel 2 0"
    "joel daniel 8 5"
    "arul niko 3 5"
    "joel niko 6 5"
    "arul daniel 4 0"
    "arul joel 3 2"
    "niko daniel 2 3"
    "arul niko 5 4"
    "joel daniel 5 2"
    "joel niko 4 3"
    "arul daniel 3 2"
    "niko daniel 5 2"
    "arul joel 4 1"
    "niko daniel 1 2"
    "arul joel 6 2"
    "niko daniel 3 0"
    "arul daniel 6 1"
    "arul niko 6 5"
    "joel daniel 1 1"
    "arul daniel 2 3"
    "joel niko 2 8"
    "arul joel 5 5"
    "niko daniel 5 3"
    "arul niko 0 11"
    "joel daniel 5 0"
    "arul daniel 3 2"
    "joel niko 3 5"
    "arul niko 1 7"
    "joel daniel 2 3"
    "niko arul 6 6"
    "niko arul 5 3"
    "niko arul 1 4"
    "niko arul 9 4"
    "niko arul 7 3"
    "niko arul 1 3"
    "niko arul 9 4"
    "niko arul 2 3"
    "niko arul 7 3"
    "niko arul 7 8"
    "niko arul 0 3"
    "niko arul 5 7"
    "niko arul 2 5"
    "niko arul 2 7"
    "niko arul 3 6"
    "niko arul 5 5"
    "niko arul 1 1"
    "niko arul 4 3"
    "niko arul 3 2"
    "niko arul 3 5"
    "niko arul 5 5"
    "niko joel 5 4"
    "arul joel 4 4"
    "niko arul 8 3"
    "niko joel 8 5"
    "arul joel 2 2"
    "niko arul 4 2"
    "niko joel 0 2"
    "arul niko 3 6"
    "arul niko 4 6"
    "arul niko 2 3"
    "arul niko 3 2"
    "arul niko 6 6"
    "arul niko 4 1"
    "arul niko 2 6"
    "arul niko 3 5"
    "joel niko 1 2"
    "joel niko 2 4"
    "arul joel 5 4"
    "arul joel 4 4"
    "arul niko 4 3"
    "arul niko 5 2"
    "niko joel 10 6"
    "niko arul 4 3"
    "arul niko 1 2"
    "arul niko 0 3"
    "arul niko 5 4"
    "arul niko 3 4"
    "arul niko 5 4"
    "arul niko 4 5"
    "arul niko 5 4"
    "arul niko 5 0"
    "arul niko 6 8"
    "arul niko 3 6"
)

for game in "${games[@]}"; do
    set -- $game
    p1=$1
    p2=$2
    s1=$3
    s2=$4

    echo "Submitting: $p1 vs $p2 ($s1-$s2)"
    python sign_submit.py post \
        --url http://localhost:8000/ \
        --p1 "$p1" \
        --p2 "$p2" \
        --s1 "$s1" \
        --s2 "$s2" \
        --played_at "$PLAYED_AT"
done
