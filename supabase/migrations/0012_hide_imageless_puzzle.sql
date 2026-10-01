-- "Which building is this?" was seeded without an image, so players saw only letter tiles.
-- Hidden until an admin uploads the picture and re-activates it. Spec: docs/specs/question-images.md
update questions
set is_active = false
where prompt = 'Which building is this?' and image_url is null;
