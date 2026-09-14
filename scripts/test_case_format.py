import copy
import json
import unittest
from pathlib import Path
from case_format import validate, render
ROOT = Path(__file__).resolve().parents[1]
class CaseFormatTest(unittest.TestCase):
    def test_ilvi_publishes_only_approved_rounded_financials(self):
        data = json.loads((ROOT/'cases/_content/ilvi.json').read_text())
        validate(data, self.ids)
        out = render(data, self.registry, '').replace('\u00a0', ' ')
        for private in ('118 758', '118758', '5 728', '5728', '20,73', '20,7×', 'Как считали', 'id="measurement"', 'href="#measurement"'):
            self.assertNotIn(private, out)
        self.assertIn('05 / Вывод', out)
        self.assertIn('$120 тыс.', out)
        self.assertIn('$5 тыс.', out)
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
    def test_funnel_rejects_mismatched_labels(self):
        self.data['results']['funnel'][1]['value'] = '127'
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_funnel_rejects_zero_denominator(self):
        self.data['results']['funnel'][0]['count'] = 0
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_funnel_rejects_increasing_counts(self):
        self.data['results']['funnel'][1]['count'] = 900
        with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_funnel_uses_distinct_denominators(self):
        out = render(self.data, self.registry, '')
        self.assertIn('69,8% от предыдущего этапа', out)
        self.assertIn('13,5% от всех диалогов', out)
        self.assertIn('width:13.4969%', out)
    def test_return_uses_exact_totals_not_display_rounding(self):
        self.data['results']['return'] = {'revenue': 118758, 'spend': 5728}
        self.data['metrics'][0]['value'] = '$120 тыс.'
        self.data['metrics'][1]['value'] = '$5 тыс.'
        out = render(self.data, self.registry, '')
        self.assertIn('$20,73</strong>', out)
        self.assertNotIn('$24,00</strong>', out)
    def test_return_rejects_invalid_denominators(self):
        for spend in (0, -1, float('nan'), float('inf'), True, '5728'):
            with self.subTest(spend=spend):
                self.data['results']['return'] = {'revenue': 118758, 'spend': spend}
                with self.assertRaises(ValueError): validate(self.data, self.ids)
    def test_market_count_rejects_duplicates(self):
        self.data['markets'] = {'origin': 'Стамбул', 'countries': ['Узбекистан', 'Узбекистан']}
        with self.assertRaises(ValueError): validate(self.data, self.ids)
if __name__ == '__main__': unittest.main()
