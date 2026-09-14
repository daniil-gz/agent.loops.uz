import copy
import json
import unittest
from pathlib import Path
from case_format import validate, render
ROOT = Path(__file__).resolve().parents[1]
class CaseFormatTest(unittest.TestCase):
    def setUp(self):
        self.data = json.loads((ROOT/'cases/_content/nwl.json').read_text())
        self.registry = json.loads((ROOT/'cases/cases.json').read_text())
        self.ids = {c['id'] for c in self.registry}
    def test_missing_definition_is_rejected(self):
        del self.data['metrics'][0]['definition']
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_invalid_related_case_is_rejected(self):
        self.data['related'] = ['does-not-exist']
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_asset_path_traversal_is_rejected(self):
        self.data['cover'] = '/../private.png'
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_editorial_notes_never_ship(self):
        self.data['editorial']['note'] = 'EDITORIAL_SENTINEL'
        out = render(self.data, self.registry, '')
        self.assertNotIn('EDITORIAL_SENTINEL', out)
        self.assertNotIn('omittedClaims', out)
        self.assertIn('https://loops.uz/cases/case-nwl/', out)
    def test_text_is_escaped_in_html_and_jsonld(self):
        self.data['headline'] = '</script><script>alert(1)</script>'
        out = render(self.data, self.registry, '')
        self.assertNotIn('<script>alert(1)', out)
        self.assertIn('&lt;script&gt;', out)
        self.assertIn('\\u003c/script>', out)
    def test_case_can_describe_work_other_than_ads(self):
        self.data['workTitle'] = 'Обучили команду клиента.'
        out = render(self.data, self.registry, '')
        self.assertIn('<h2>Обучили команду клиента.</h2>', out)
if __name__ == '__main__': unittest.main()
