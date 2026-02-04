// Registry of Cases
// NOTE: Since we are running locally without a web server, we cannot "read" the HTML files directly.
// We must define the card data here.
window.casesData = [
    {
        id: 'feedup',
        category: 'services',
        url: '/cases/case-feedup/',
        image: '/images/feedup-main.png',
        niche: 'Фастфуд / HoReCa',
        title: 'FeedUp',
        desc: 'Работа с репутацией: решили 100% проблем клиентов и внедрили скрипты заботы.',
        stats: [
            { val: '100%', label: 'Решение жалоб' },
            { val: 'ORM', label: 'Система', isAccent: true }
        ]
    },
    {
        id: 'izzy',
        category: 'services',
        url: '/cases/case-izzy/',
        image: '/images/izzy-main.png',
        niche: 'Кикшеринг',
        title: 'IZZY Scooters',
        desc: 'Рост базы пользователей на +97% и внедрение автоворонки промокодов.',
        stats: [
            { val: '+97%', label: 'Рост Базы' },
            { val: '+20%', label: 'Время Аренды', isAccent: true }
        ]
    },
    {
        id: 'dco',
        category: 'b2b',
        url: '/cases/case-dco/',
        image: '/images/dco-main.png',
        niche: 'Сантехника',
        title: 'DCO Euroluxe',
        desc: 'Обучение сотрудника с нуля: контент, таргет, аналитика. Выручка 45 млн.',
        stats: [
            { val: '$200', label: 'Бюджет' },
            { val: '45 млн', label: 'Выручка', isAccent: true }
        ]
    },
    {
        id: 'basalt',
        category: 'b2b',
        url: '/cases/case-basalt/',
        image: '/images/basalt-main.png',
        niche: 'Производство / B2B',
        title: 'Basalt Uzbekistan',
        desc: 'Крупный опт: 3 млрд с одной сделки и выход на экспорт через LinkedIn.',
        stats: [
            { val: '3 млрд', label: 'Сделка' },
            { val: '4+', label: 'Встречи/мес', isAccent: true }
        ]
    },
    {
        id: 'chery',
        category: 'auto',
        url: '/cases/case-chery/',
        image: '/images/chery-main.png',
        niche: 'Автобизнес',
        title: 'Дилерский центр Chery',
        desc: 'Снижение стоимости лида в 3 раза через автоворонку.',
        stats: [
            { val: '450+', label: 'Заявок/мес' },
            { val: '$4.5', label: 'Цена Лида', isAccent: true }
        ]
    },
    {
        id: 'rebar',
        category: 'b2b',
        url: '/cases/case-rebar/',
        image: 'https://placehold.co/600x400/222/555?text=Composite+Rebar',
        niche: 'Производство / B2B',
        title: 'Композитная Арматура',
        desc: 'Квалификация оптовых покупателей на автомате.',
        stats: [
            { val: 'ROI 400%', label: 'Окупаемость' },
            { val: '$250k', label: 'Сумма Сделки', isAccent: true }
        ]
    },

];
