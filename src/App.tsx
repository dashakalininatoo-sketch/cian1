import { useEffect, useState } from 'react'
import './map.css'

type Step = 0 | 1 | 2 | 3 | 4 | 5
type Form = { name: string; email: string; purchase: string; object: string; advisor: string; income: string; otherIncome: string; debt: string; debtPayment: string; day: string; time: string; marketing: boolean }

const purchase = [['month', 'В течение месяца'], ['three', 'Через 1–3 месяца'], ['six', 'Через 3–6 месяцев'], ['study', 'Пока изучаю']]
const objects = [['yes', 'Да, уже выбрал(а)'], ['choose', 'Пока выбираю'], ['budget', 'Хочу понять бюджет']]
const days = [['20', 'Сегодня'], ['21', 'Завтра'], ['22', 'Чт']]
const times = ['10:00–12:00', '12:00–15:00', '15:00–18:00', '18:00–21:00']
const initial: Form = { name: '', email: 'daria@example.com', purchase: '', object: '', advisor: '', income: '', otherIncome: '', debt: '', debtPayment: '', day: '', time: '', marketing: false }

const METRIKA_ID = 99999999
type MetricParams = Record<string, string | number | boolean>
declare global { interface Window { ym?: (id: number, command: 'reachGoal', goal: string, params: MetricParams) => void } }
function metric(goal: string, step: number, params: MetricParams = {}) {
  const payload = { step, ...params }
  // Заглушка Яндекс Метрики: при подключении счётчика замените номер выше.
  window.ym?.(METRIKA_ID, 'reachGoal', goal, payload)
  console.info('[Metrika stub]', goal, payload)
}

function MortgageForm() {
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<Form>(initial)
  const [errors, setErrors] = useState<string[]>([])
  const set = <K extends keyof Form>(key: K, value: Form[K]) => { setForm(current => ({ ...current, [key]: value })); setErrors(current => current.filter(error => error !== key)); if (['purchase', 'object', 'advisor', 'income', 'debt', 'day', 'time'].includes(key)) metric('mortgage_field_select', step, { field: key, value: String(value) }) }
  const active = step > 0 && step < 5
  useEffect(() => { metric(step === 0 ? 'mortgage_form_open' : step === 5 ? 'mortgage_success_view' : 'mortgage_step_view', step) }, [step])
  const goNext = () => {
    const invalid: string[] = []
    if (step === 1) { if (form.name.trim().split(/\s+/).length < 2) invalid.push('name'); if (!/^\S+@\S+\.\S+$/.test(form.email)) invalid.push('email') }
    if (step === 2) { if (!form.purchase) invalid.push('purchase'); if (!form.object) invalid.push('object') }
    if (step === 3) { if (!form.income) invalid.push('income'); if (form.income === 'other' && !/\d/.test(form.otherIncome)) invalid.push('otherIncome'); if (!form.debt) invalid.push('debt'); if (form.debt === 'yes' && !/\d/.test(form.debtPayment)) invalid.push('debtPayment') }
    if (step === 4 && (!form.day || !form.time)) invalid.push('call')
    if (invalid.length) { setErrors(invalid); return }
    const next = Math.min(5, step + 1) as Step
    metric(step === 4 ? 'mortgage_submit' : 'mortgage_step_continue', step, { to_step: next })
    setErrors([]); setStep(next)
  }
  const Choice = ({ field, value, children, wide = false }: { field: keyof Form; value: string; children: React.ReactNode; wide?: boolean }) => <button className={`choice ${form[field] === value ? 'choice--selected' : ''} ${wide ? 'choice--wide' : ''}`} onClick={() => set(field, value)}>{children}</button>
  const Error = ({ id, children }: { id: string; children: React.ReactNode }) => errors.includes(id) ? <span className="error">{children}</span> : null

  let content: React.ReactNode
  if (step === 0) content = <div className="welcome"><span className="eyebrow">Ипотека · после расчёта</span><h1>Поможем<br />с ипотекой</h1><p>Ответьте на несколько вопросов — эксперт подберёт варианты. Без документов и выбора банка.</p><div className="calculation"><span>Ваш ориентировочный платёж</span><strong>52 300 ₽ в месяц</strong><small>Семейная ипотека · новостройка</small></div><span className="duration"><i />Займёт около 2 минут</span></div>
  else if (step === 1) content = <><h1>Давайте познакомимся</h1><p>Контакты нужны, чтобы эксперт мог связаться с вами.</p><Field label="ФИО" error={errors.includes('name') ? 'Введите имя и фамилию' : undefined}><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Например, Анна Иванова" /></Field><Field label="Электронная почта" hint="Почта из профиля — её можно изменить" error={errors.includes('email') ? 'Проверьте адрес почты' : undefined}><input value={form.email} onChange={e => set('email', e.target.value)} /></Field><Field label="Телефон" hint="Номер из профиля. Изменить его можно в профиле"><input value="+7 999 123-45-67" disabled /></Field></>
  else if (step === 2) content = <><h1>Расскажите о планах</h1><p>Так эксперт подготовится к разговору.</p><section className="question"><b>Когда планируете покупку?</b><div className="choices">{purchase.map(([value, label]) => <Choice key={value} field="purchase" value={value}>{label}</Choice>)}</div><Error id="purchase">Выберите подходящий вариант</Error></section><section className="question"><b>Уже есть объект?</b><div className="choices">{objects.map(([value, label]) => <Choice key={value} field="object" value={value}>{label}</Choice>)}</div><Error id="object">Выберите подходящий вариант</Error></section><section className="advisor"><b>Помочь с подбором?</b><p>Подскажем варианты по семейной ипотеке и новостройкам.</p><div className="choices"><Choice field="advisor" value="yes" wide>Да, нужна помощь</Choice><Choice field="advisor" value="no" wide>Нет, спасибо</Choice></div></section></>
  else if (step === 3) content = <><h1>Оценим возможности</h1><p>Достаточно примерных сумм — подтверждать доход сейчас не нужно.</p><section className="question"><b>Доход в месяц</b><div className="chips">{[['100', 'До 100 тыс.'], ['200', '100–200 тыс.'], ['300', '200–300 тыс.'], ['more', 'Больше 300 тыс.'], ['other', 'Укажу сам']].map(([value, label]) => <button key={value} className={form.income === value ? 'chip chip--selected' : 'chip'} onClick={() => set('income', value)}>{label}</button>)}</div><Error id="income">Выберите диапазон дохода</Error>{form.income === 'other' && <Field label="Ваш доход" error={errors.includes('otherIncome') ? 'Укажите доход больше 0' : undefined}><input value={form.otherIncome} inputMode="numeric" onChange={e => set('otherIncome', e.target.value)} placeholder="Например, 180 000 ₽" /></Field>}</section><section className="question"><b>Есть кредиты?</b><div className="split"><Choice field="debt" value="no">Нет</Choice><Choice field="debt" value="yes">Да</Choice></div><Error id="debt">Выберите вариант</Error>{form.debt === 'yes' && <Field label="Ежемесячный платёж" error={errors.includes('debtPayment') ? 'Укажите сумму платежа' : undefined}><input value={form.debtPayment} inputMode="numeric" onChange={e => set('debtPayment', e.target.value)} placeholder="Например, 15 000 ₽" /></Field>}</section></>
  else if (step === 4) content = <><h1>Когда удобно позвонить?</h1><p>Выберите время в ближайшие три дня.</p><div className="days">{days.map(([value, label]) => <button key={value} className={form.day === value ? 'day day--selected' : 'day'} onClick={() => set('day', value)}>{label}<b>{value} ноя</b></button>)}</div><div className="times">{times.map(time => <button key={time} className={form.time === time ? 'time time--selected' : 'time'} onClick={() => set('time', time)}>{time}</button>)}</div><Error id="call">Выберите дату и время звонка</Error><div className="legal">Нажимая «Продолжить», вы принимаете <a href="#terms">условия сервиса</a> и соглашаетесь на обработку данных и передачу заявки ипотечному брокеру-партнёру.</div><label className="marketing"><input type="checkbox" checked={form.marketing} onChange={e => set('marketing', e.target.checked)} />Получать предложения Циана и партнёров об ипотеке</label></>
  else content = <div className="success"><div className="success__icon">✓</div><h1>Заявка у эксперта</h1><p>Ничего заполнять дополнительно не нужно. Эксперт уточнит детали и подберёт варианты.</p><div className="call-card"><span>Позвоним</span><b>{form.day === '20' ? 'Сегодня' : form.day === '21' ? 'Завтра' : 'В четверг'}, {form.time}</b><small>Если планы изменятся, перенесём звонок без проблем.</small></div></div>

  return <main className="stage"><section className="phone"><header><button className={active ? 'back' : 'back back--hidden'} onClick={() => setStep(current => Math.max(0, current - 1) as Step)} aria-label="Назад">‹</button><strong>циан<span>.</span></strong></header>{active && <><div className="step-label">{['Контакты', 'Планы', 'Доход', 'Звонок'][step - 1]} · {step} из 4</div><div className="progress"><i style={{ width: `${step * 25}%` }} /></div></>}<article>{content}</article><footer>{step < 5 ? <button className="primary" onClick={goNext}>Продолжить</button> : <button className="primary" onClick={() => { setForm(initial); setStep(0) }}>Вернуться к расчёту</button>}</footer></section></main>
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) { return <label className={error ? 'field field--invalid' : 'field'}><b>{label}</b>{children}{hint && <small>{hint}</small>}{error && <span className="error">{error}</span>}</label> }
function ScenarioMap() {
  const screens = [
    ['0', 'Вход', 'Поможем с ипотекой', 'Калькулятор · 52 300 ₽'],
    ['1', 'Контакты', 'Давайте познакомимся', 'ФИО · почта · телефон'],
    ['2', 'Планы', 'Расскажите о планах', 'Покупка · объект · подбор'],
    ['3', 'Доход', 'Оценим возможности', 'Доход · кредиты'],
    ['4', 'Звонок', 'Когда удобно позвонить?', 'Дата · интервал'],
    ['5', 'Успех', 'Заявка у эксперта', 'Подтверждённый звонок'],
  ]
  return <main className="map-page"><header className="map-header"><a href="/" className="map-brand">циан<span>.</span></a><a href="/" className="map-back">← К прототипу</a></header><section className="map-intro"><span className="map-kicker">Карта сценария · /map</span><h1>Короткая заявка на ипотеку</h1><p>Экранные события передаются в Метрику с параметром <code>step</code>. Счётчик — заглушка <code>{METRIKA_ID}</code>.</p></section><section className="map-flow" aria-label="Карта экранов и событий">{screens.map((screen, index) => <div className="map-node" key={screen[0]}><article className="screen-card"><div className="screen-top"><span>9:41</span><i>циан.</i></div><div className="screen-preview"><span className="screen-step">Шаг {screen[0]}</span><b>{screen[2]}</b><small>{screen[3]}</small><i /><i /><button>{index === 5 ? 'Готово' : 'Продолжить'}</button></div><footer>{screen[1]}</footer></article><div className="screen-events"><code>{index === 0 ? 'mortgage_form_open' : index === 5 ? 'mortgage_success_view' : 'mortgage_step_view'}</code><span>{`{ step: ${screen[0]} }`}</span>{index === 2 && <span>+ <code>mortgage_field_select</code></span>}{index === 3 && <span>+ поле платежа при <code>debt: yes</code></span>}</div>{index < screens.length - 1 && <div className="map-arrow"><span><code>{index === 4 ? 'mortgage_submit' : 'mortgage_step_continue'}</code> · {`{ step: ${screen[0]}, to_step: ${Number(screen[0]) + 1} }`}</span><b>↓</b></div>}</div>)}</section><section className="ab-test"><span className="map-kicker">План A/B-теста</span><h2>Проверяем, снижает ли короткая анкета барьер входа</h2><dl><div><dt>Гипотеза</dt><dd>Вариант B увеличит долю завершённых заявок без ухудшения качества лидов.</dd></div><div><dt>Вариант B</dt><dd>Вместо полной банковской анкеты — 4 коротких шага и звонок брокера.</dd></div><div><dt>Основная метрика</dt><dd><code>mortgage_success_view / mortgage_form_open</code>.</dd></div><div><dt>Ограничивающая метрика</dt><dd>Доля дозвонов брокера в выбранный пользователем интервал.</dd></div><div><dt>Выборка и срок</dt><dd>По 1 700 входов на вариант (3 400 всего); минимум 14 дней, чтобы покрыть недельную сезонность.</dd></div></dl></section></main>
}
function App() { return window.location.pathname === '/map' ? <ScenarioMap /> : <MortgageForm /> }
export default App
