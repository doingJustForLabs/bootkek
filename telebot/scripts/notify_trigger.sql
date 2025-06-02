-- Удалим старую функцию и триггер (если есть)
DROP TRIGGER IF EXISTS trigger_notify_follower ON followers;
DROP FUNCTION IF EXISTS notify_new_follower;

-- Создаём новую функцию
CREATE OR REPLACE FUNCTION notify_new_follower() RETURNS trigger AS $$
DECLARE
    payload JSON;
BEGIN
    payload = json_build_object(
        'follower_id', NEW.follower_id,
        'target_id', NEW.target_id
    );

    PERFORM pg_notify('new_follower', payload::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер на INSERT в followers
CREATE TRIGGER trigger_notify_follower
AFTER INSERT ON followers
FOR EACH ROW
EXECUTE FUNCTION notify_new_follower();
