# Fetching Module

This module is responsible for pulling/receiving content from sources specified by the user (Twitter, Crowdtangle, RSS, etc.)

It runs in the background as its own process and reads source definitons from the database. It is notified via inter-process communication when sources have changed.

