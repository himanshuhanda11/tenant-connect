-- Delete messages for these conversations
DELETE FROM messages WHERE conversation_id IN (
  '1a8e4e20-0ca5-4b2c-8e94-1382c586d6e0',
  '042c6578-6299-433b-88be-fec79e0b8c10',
  '2cd09363-214a-4b12-93ae-b37952cfe30a',
  '95d69f6d-bd2e-44dd-ac17-3f76e996b381'
);

-- Delete conversation events
DELETE FROM smeksh_conversation_events WHERE conversation_id IN (
  '1a8e4e20-0ca5-4b2c-8e94-1382c586d6e0',
  '042c6578-6299-433b-88be-fec79e0b8c10',
  '2cd09363-214a-4b12-93ae-b37952cfe30a',
  '95d69f6d-bd2e-44dd-ac17-3f76e996b381'
);

-- Delete inbox activity logs
DELETE FROM inbox_activity_logs WHERE conversation_id IN (
  '1a8e4e20-0ca5-4b2c-8e94-1382c586d6e0',
  '042c6578-6299-433b-88be-fec79e0b8c10',
  '2cd09363-214a-4b12-93ae-b37952cfe30a',
  '95d69f6d-bd2e-44dd-ac17-3f76e996b381'
);

-- Delete conversations
DELETE FROM conversations WHERE id IN (
  '1a8e4e20-0ca5-4b2c-8e94-1382c586d6e0',
  '042c6578-6299-433b-88be-fec79e0b8c10',
  '2cd09363-214a-4b12-93ae-b37952cfe30a',
  '95d69f6d-bd2e-44dd-ac17-3f76e996b381'
);

-- Delete contacts
DELETE FROM contacts WHERE id IN (
  '7c5a2be4-d37f-427d-bdb7-e1efa51a07cf',
  '814f11b8-d85a-4afb-8c67-44ce6693f236',
  '12dec8e2-0800-4513-ac4e-0ed576270757',
  'd7c6870e-b303-437f-a2c4-fbf2a9647490'
);