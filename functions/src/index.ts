import * as admin from 'firebase-admin';
admin.initializeApp();

const sessions = require('./sessions');
exports.createSession = sessions.createSession;
exports.joinSession = sessions.joinSession;
exports.leaveSession = sessions.leaveSession;
exports.endSession = sessions.endSession;

const trackCounts = require('./trackCounts');
exports.addTrackCounts = trackCounts.addTrackCounts;
