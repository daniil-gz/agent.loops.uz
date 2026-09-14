import copy
import json
import unittest
from pathlib import Path
from case_gallery import gallery_markup, validate_gallery

ROOT = Path(__file__).resolve().parents[1]

class GalleryTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT/'cases/_content/ilvi.json').read_text())

    def test_asset_paths_exist_and_traversal_is_rejected(self):
        validate_gallery(self.data)
        self.data['gallery']['items'][0]['src'] = '/images/../private.jpg'
        with self.assertRaises(ValueError): validate_gallery(self.data)

    def test_unredacted_phone_cannot_be_published(self):
        self.data['gallery']['conversations'][0]['messages'][0]['text'] = '+000 123 456 789'
        with self.assertRaises(ValueError): validate_gallery(self.data)

    def test_untrusted_copy_is_escaped(self):
        self.data['gallery']['items'][0]['title'] = '<script>alert(1)</script>'
        out = gallery_markup(self.data['gallery'])
        self.assertNotIn('<script>', out)
        self.assertIn('&lt;script&gt;', out)

    def test_gallery_has_fallbacks_and_no_raw_chat_assets(self):
        out = gallery_markup(self.data['gallery'])
        self.assertEqual(out.count('data-creative '), 7)
        self.assertIn('Личные данные скрыты', out)
        self.assertIn('[Контакт скрыт]', out)
        for private in ('codex-clipboard', '12 сент.', '28 авг.', '29 авг.', 'Балта', 'Нукус'):
            self.assertNotIn(private, out)
        self.assertNotIn('/var/folders', out)

if __name__ == '__main__': unittest.main()
