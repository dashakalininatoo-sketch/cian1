import { useEffect, useRef, useState, type ReactNode } from 'react'

type Category = 'Купить' | 'Снять' | 'Новостройки' | 'Посуточно' | 'Коммерческая'
type Screen =
  | { kind: 'home' }
  | { kind: 'search'; category?: Category }
  | { kind: 'results'; category: Category; query?: string; saved?: boolean }
  | { kind: 'detail'; listingId: number }
  | { kind: 'ad' }

type Listing = {
  id: number
  title: string
  address: string
  price: string
  note: string
  image: string
  category: Category
  tags: string[]
  description: string
}

const categories: { name: Category; icon: string; tone: string }[] = [
  { name: 'Купить', icon: 'key', tone: 'lime' },
  { name: 'Снять', icon: 'sofa', tone: 'peach' },
  { name: 'Новостройки', icon: 'building', tone: 'blue' },
  { name: 'Посуточно', icon: 'sun', tone: 'lavender' },
  { name: 'Коммерческая', icon: 'store', tone: 'mint' },
]

const listings: Listing[] = [
  {
    id: 1,
    title: 'Квартира, в которую хочется возвращаться',
    address: 'Хамовники · ул. Усачёва, 11',
    price: '28,4 млн ₽',
    note: '2 комнаты · 64 м² · 8 этаж',
    image: '/images/home-sun.svg',
    category: 'Купить',
    tags: ['У метро', 'Светлая', 'Новый ремонт'],
    description: 'Тихая квартира с большими окнами и видом на зелёный двор. До метро пять минут пешком, рядом кафе, школа и набережная.',
  },
  {
    id: 2,
    title: 'Пространство для новых привычек',
    address: 'Пресненский · ул. 1905 года, 5',
    price: '135 000 ₽/мес.',
    note: '2 комнаты · 58 м² · 12 этаж',
    image: '/images/loft.svg',
    category: 'Снять',
    tags: ['Можно с питомцем', 'Балкон', 'У метро'],
    description: 'Воздушная квартира с отдельной рабочей зоной, тёплым светом и продуманным хранением. Готова к заселению.',
  },
  {
    id: 3,
    title: 'Город рядом. Тишина внутри.',
    address: 'ЖК «Садовые кварталы» · Хамовники',
    price: 'от 31,8 млн ₽',
    note: 'Новостройка · 72 м² · сдача в 2027',
    image: '/images/courtyard.svg',
    category: 'Новостройки',
    tags: ['Двор без машин', 'Рядом парк', 'Семейный'],
    description: 'Современный дом с открытым зелёным двором, камерными входными группами и продуманной инфраструктурой района.',
  },
  {
    id: 4,
    title: 'Побег на выходные в центре',
    address: 'Арбат · Большой Николопесковский пер.',
    price: '8 900 ₽/сутки',
    note: '1 комната · 38 м² · до 3 гостей',
    image: '/images/loft.svg',
    category: 'Посуточно',
    tags: ['Самозаселение', 'Центр', 'Wi-Fi'],
    description: 'Уютная квартира для короткой поездки: прогулки по старым улицам, любимые кофейни и спокойный вечер дома.',
  },
  {
    id: 5,
    title: 'Место для вашего дела',
    address: 'Даниловский · ул. Летниковская, 10',
    price: '210 000 ₽/мес.',
    note: 'Помещение · 92 м² · первый этаж',
    image: '/images/courtyard.svg',
    category: 'Коммерческая',
    tags: ['Первая линия', 'Витрины', 'Свободная планировка'],
    description: 'Светлое помещение на оживлённой улице. Подойдёт для студии, магазина или небольшой кофейни.',
  },
]

function matchesQuery(listing: Listing, query: string) {
  const words = query.toLocaleLowerCase('ru').split(/[^\p{L}\p{N}]+/u).filter(word => word.length >= 4)
  if (words.length === 0) return true
  const searchable = `${listing.title} ${listing.address} ${listing.note} ${listing.tags.join(' ')}`.toLocaleLowerCase('ru')
  return words.some(word => searchable.includes(word))
}

function Icon({ name, size = 22 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.3 4.3" /></>,
    arrow: <><path d="M4 12h16" /><path d="m13 5 7 7-7 7" /></>,
    back: <><path d="M20 12H4" /><path d="m11 19-7-7 7-7" /></>,
    pin: <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.4" /></>,
    key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9 2 2-2 2 1 1-3 3-2-2-3 3" /></>,
    sofa: <><path d="M4 13V9a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v4" /><path d="M4 12a2 2 0 0 0-2 2v4h20v-4a2 2 0 0 0-2-2" /><path d="M5 18v2m14-2v2" /></>,
    building: <><path d="M5 21V5l7-3 7 3v16" /><path d="M3 21h18M9 7v2m6-2v2M9 12v2m6-2v2M9 17v4h6v-4" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    store: <><path d="m3 9 2-6h14l2 6v3a3 3 0 0 1-5 2 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-5-2V9Z" /><path d="M5 15v6h14v-6M9 21v-5h6v5" /></>,
    heart: <path d="M20.8 8.7c0 4.4-8.8 10.3-8.8 10.3S3.2 13.1 3.2 8.7a4.5 4.5 0 0 1 8.8-1.2 4.5 4.5 0 0 1 8.8 1.2Z" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>,
    sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="17" r="2" fill="currentColor" stroke="none" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    check: <path d="m4 12 5 5L20 6" />,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function ListingCard({ listing, onOpen, compact = false }: { listing: Listing; onOpen: () => void; compact?: boolean }) {
  return <button className={`listing-card ${compact ? 'listing-card--compact' : ''}`} onClick={onOpen}>
    <span className="listing-image-wrap"><img src={listing.image} alt="" className="listing-image" /><span className="listing-image-chip">{listing.category}</span></span>
    <span className="listing-card-body"><span className="listing-price">{listing.price}</span><span className="listing-title">{listing.title}</span><span className="listing-meta">{listing.note}</span><span className="listing-address"><Icon name="pin" size={14} /> {listing.address}</span></span>
  </button>
}

function App() {
  const [screen, setScreen] = useState<Screen>({ kind: 'home' })
  const [mode, setMode] = useState<'new' | 'returning'>('new')
  const [query, setQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState<Category>('Купить')
  const [contactShown, setContactShown] = useState(false)
  const [favorites, setFavorites] = useState<number[]>([])
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [screen])
  useEffect(() => { if (screen.kind === 'search') searchRef.current?.focus() }, [screen])

  const goHome = () => { setScreen({ kind: 'home' }); setContactShown(false) }
  const openSearch = (category?: Category) => {
    setSearchCategory(category ?? 'Купить')
    setQuery('')
    setScreen({ kind: 'search', category })
  }
  const showResults = (category: Category, searchQuery = '', saved = false) => setScreen({ kind: 'results', category, query: searchQuery, saved })
  const visibleResults = screen.kind === 'results' ? listings.filter(item => item.category === screen.category && matchesQuery(item, screen.query ?? '')) : []
  const detail = screen.kind === 'detail' ? listings.find(item => item.id === screen.listingId) : undefined

  return <div className="site-stage">
    <div className="stage-caption"><span className="stage-mark">циан.</span><span>Концепт мобильной главной<br />Кликабельный прототип · Москва</span></div>
    <div className="app-shell">
      {screen.kind === 'home' && <>
        <div className="hero">
          <div className="hero-glow" aria-hidden="true" />
          <header className="hero-header"><span className="brand">циан<span className="brand-dot">.</span></span><span className="city"><Icon name="pin" size={16} /> Москва</span></header>
          <div className="demo-switch" aria-label="Демонстрационное состояние"><span>Режим просмотра</span><div className="demo-options"><button className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')} aria-pressed={mode === 'new'}>Новый</button><button className={mode === 'returning' ? 'active' : ''} onClick={() => setMode('returning')} aria-pressed={mode === 'returning'}>Вернулся</button></div></div>
          <div className="hero-content"><p className="hero-kicker">Место для жизни</p><h1>{mode === 'new' ? <>Город большой.<br /><em>Ваше место</em> —<br />рядом.</> : <>Продолжим<br /><em>искать ваше</em><br />место?</>}</h1></div>
          <button className="hero-search" onClick={() => openSearch()}><Icon name="search" size={22} /><span>{mode === 'new' ? 'Район, метро или адрес' : 'Найти что-то новое'}</span><span className="search-action"><Icon name="arrow" size={19} /></span></button>
          {mode === 'returning' && <button className="hero-continue" onClick={() => showResults('Купить', 'Хамовники, 2 комнаты', true)}><Icon name="clock" size={16} /><span>Продолжить: Хамовники, 2 комнаты</span><Icon name="arrow" size={15} /></button>}
        </div>

        <main>
          <section className="category-section" aria-labelledby="category-title"><div className="section-heading"><h2 id="category-title">Какие планы?</h2><p>Начните с того, что важно вам</p></div><div className="category-grid">{categories.map(category => <button className={`category-tile tone-${category.tone}`} key={category.name} onClick={() => showResults(category.name)}><span className="category-icon"><Icon name={category.icon} size={24} /></span><span className="category-name">{category.name}</span><Icon name="arrow" size={17} /></button>)}</div></section>

          <section className="recommend-section" aria-labelledby="recommend-title"><div className="section-heading recommend-heading"><div><span className="eyebrow">{mode === 'new' ? 'Вдохновиться' : 'Для вас'}</span><h2 id="recommend-title">Найти своё —<br />это чувство.</h2></div><span className="heading-symbol" aria-hidden="true">✳</span></div><p className="section-intro">Места, в которых легко представить жизнь.</p><div className="featured-listings"><ListingCard listing={listings[0]} onOpen={() => setScreen({ kind: 'detail', listingId: 1 })} /><ListingCard listing={listings[1]} onOpen={() => setScreen({ kind: 'detail', listingId: 2 })} compact /></div></section>

          {mode === 'returning' && <section className="saved-section" aria-labelledby="saved-title"><div className="section-heading heading-with-arrow"><div><h2 id="saved-title">С того места</h2><p>Ваши поиски ждут вас</p></div><Icon name="clock" size={23} /></div><button className="saved-search" onClick={() => showResults('Купить', 'Хамовники, 2 комнаты', true)}><span className="saved-icon"><Icon name="search" /></span><span><strong>Купить в Хамовниках</strong><small>2 комнаты · до 30 млн ₽</small></span><Icon name="arrow" size={20} /></button><button className="saved-search saved-search--second" onClick={() => showResults('Снять', 'Пресненский, с питомцем', true)}><span className="saved-icon"><Icon name="search" /></span><span><strong>Снять у метро</strong><small>Можно с питомцем · до 150 000 ₽</small></span><Icon name="arrow" size={20} /></button></section>}

          <section className="ad-section" aria-label="Рекламное предложение"><button className="ad-card" onClick={() => setScreen({ kind: 'ad' })}><span className="ad-label">Реклама · Партнёрский проект</span><span className="ad-art" aria-hidden="true"><span className="ad-circle" /><span className="ad-house" /></span><span className="ad-title">У нового дома<br />свои привычки.</span><span className="ad-bottom">Кварталы с зелёными дворами <Icon name="arrow" size={20} /></span></button></section>

          <section className="feed-section" aria-labelledby="feed-title"><div className="section-heading"><h2 id="feed-title">Дальше — больше</h2><p>Новые места и идеи для поиска</p></div><ListingCard listing={listings[2]} onOpen={() => setScreen({ kind: 'detail', listingId: 3 })} compact /><button className="feed-link" onClick={() => showResults('Новостройки')}>Смотреть новостройки <Icon name="arrow" size={19} /></button></section>
        </main>
        <footer className="app-footer"><span>циан.</span><small>Дом начинается с поиска.</small></footer>
      </>}

      {screen.kind === 'search' && <div className="inner-screen"><header className="inner-header"><button className="icon-button" onClick={goHome} aria-label="Назад на главную"><Icon name="back" /></button><span className="inner-brand">циан.</span><span className="header-spacer" /></header><main className="inner-content"><span className="eyebrow blue">Начнём с главного</span><h1 className="inner-title">Что ищем?</h1><div className="search-tabs" role="group" aria-label="Тип недвижимости">{categories.map(category => <button key={category.name} className={searchCategory === category.name ? 'selected' : ''} onClick={() => setSearchCategory(category.name)}>{category.name}</button>)}</div><form className="search-form" onSubmit={event => { event.preventDefault(); showResults(searchCategory, query.trim()) }}><label htmlFor="search-query">Где хотите искать</label><div className="search-input-wrap"><Icon name="search" /><input ref={searchRef} id="search-query" value={query} onChange={event => setQuery(event.target.value)} placeholder="Район, метро или адрес" /></div><p className="search-hint">Например: Хамовники, Парк Горького или Арбат</p><button className="primary-button" type="submit">Показать варианты <Icon name="arrow" /></button></form><div className="quick-searches"><h2>Популярное в Москве</h2><button onClick={() => showResults(searchCategory, 'Хамовники')}>Хамовники <Icon name="arrow" size={17} /></button><button onClick={() => showResults(searchCategory, 'Рядом с метро')}>Рядом с метро <Icon name="arrow" size={17} /></button></div></main></div>}

      {screen.kind === 'results' && <div className="inner-screen results-screen"><header className="inner-header"><button className="icon-button" onClick={goHome} aria-label="Назад на главную"><Icon name="back" /></button><span className="inner-brand">циан.</span><span className="header-spacer" /></header><main className="inner-content"><span className="eyebrow blue">{screen.saved ? 'Сохранённый поиск' : 'Ваш поиск'}</span><h1 className="inner-title">{screen.category}<br /><em>в Москве</em></h1><p className="results-subtitle">{screen.query ? `Запрос: ${screen.query}` : 'Места, с которых можно начать.'}</p><button className="filter-summary" onClick={() => openSearch(screen.category)}><Icon name="sliders" size={20} /><span>Изменить поиск</span><Icon name="arrow" size={18} /></button><div className="results-heading"><h2>Подходящие места</h2><span>{visibleResults.length} {visibleResults.length === 1 ? 'вариант' : 'вариантов'}</span></div>{visibleResults.length > 0 ? <div className="results-list">{visibleResults.map(item => <ListingCard key={item.id} listing={item} onOpen={() => setScreen({ kind: 'detail', listingId: item.id })} compact />)}</div> : <div className="empty-results"><span className="empty-symbol" aria-hidden="true">✳</span><h3>Пока ничего не нашли</h3><p>Попробуйте другой район или посмотрите все варианты в этом направлении.</p><button onClick={() => showResults(screen.category)}>Показать все варианты <Icon name="arrow" size={18} /></button></div>}<p className="results-note">Это демонстрационные объявления для прототипа.</p></main></div>}

      {screen.kind === 'detail' && detail && <div className="inner-screen detail-screen"><div className="detail-cover"><img src={detail.image} alt="Иллюстрация объекта недвижимости" /><button className="detail-back" onClick={goHome} aria-label="Назад на главную"><Icon name="back" /></button><button className={`detail-favorite ${favorites.includes(detail.id) ? 'is-saved' : ''}`} onClick={() => setFavorites(current => current.includes(detail.id) ? current.filter(id => id !== detail.id) : [...current, detail.id])} aria-label={favorites.includes(detail.id) ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={favorites.includes(detail.id)}><Icon name="heart" /></button></div><main className="detail-content"><span className="detail-type">{detail.category} · Москва</span><h1>{detail.title}</h1><div className="detail-price">{detail.price}</div><div className="detail-address"><Icon name="pin" size={18} /> {detail.address}</div><p className="detail-note">{detail.note}</p><div className="tag-list">{detail.tags.map(tag => <span key={tag}>{tag}</span>)}</div><div className="detail-divider" /><h2>О месте</h2><p className="detail-description">{detail.description}</p><p className="results-note">Демонстрационное объявление. Контакты вымышленные.</p></main><div className="detail-cta"><button className="primary-button" onClick={() => setContactShown(true)}>{contactShown ? <><Icon name="check" /> Контакт показан: +7 999 000-00-00</> : <>Показать телефон <Icon name="arrow" /></>}</button></div></div>}

      {screen.kind === 'ad' && <div className="inner-screen ad-screen"><header className="inner-header"><button className="icon-button" onClick={goHome} aria-label="Назад на главную"><Icon name="back" /></button><span className="inner-brand">циан.</span><span className="header-spacer" /></header><main className="inner-content"><span className="eyebrow blue">Реклама · Партнёрский проект</span><h1 className="inner-title">Пространство<br /><em>для нового.</em></h1><div className="ad-detail-art"><span className="ad-circle" /><span className="ad-house" /></div><p className="ad-detail-copy">Кварталы с зелёными дворами, спокойными улицами и местами, куда приятно возвращаться.</p><button className="primary-button" onClick={() => showResults('Новостройки')}>Смотреть новостройки <Icon name="arrow" /></button></main></div>}
    </div>
  </div>
}

export default App
