'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState<any[]>([])

  // 입력 상태
  const [gongjong, setGongjong] = useState('')
  const [company, setCompany] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [gender, setGender] = useState('')
  const [lastContact, setLastContact] = useState('')
  const [memo, setMemo] = useState('')
  const [priority, setPriority] = useState(1)

  // 데이터 불러오기
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setContacts(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 추가
  const addContact = async () => {
    if (!managerName) return alert('담당자 이름 입력')

    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          gongjong,
          company,
          company_phone: companyPhone,
          manager_name: managerName,
          manager_phone: managerPhone,
          gender,
          last_contact: lastContact || null,
          memo,
          priority,
        },
      ])

    if (error) {
      alert('추가 실패')
      console.error(error)
    } else {
      alert('추가 완료')

      // 초기화
      setGongjong('')
      setCompany('')
      setCompanyPhone('')
      setManagerName('')
      setManagerPhone('')
      setGender('')
      setLastContact('')
      setMemo('')
      setPriority(1)

      fetchData()
    }
  }

  // 검색
  const filtered = contacts.filter((c) =>
    (c.manager_name || '').includes(search) ||
    (c.company || '').includes(search)
  )

  return (
    <div className="p-4 max-w-md mx-auto">

      <h1 className="text-xl font-bold mb-4">현장 연락처</h1>

      {/* 입력 */}
      <div className="mb-4 border p-3 rounded">

        <input placeholder="공종" className="w-full border p-2 mb-2"
          value={gongjong} onChange={(e) => setGongjong(e.target.value)} />

        <input placeholder="업체명" className="w-full border p-2 mb-2"
          value={company} onChange={(e) => setCompany(e.target.value)} />

        <input placeholder="본사번호" className="w-full border p-2 mb-2"
          value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />

        <input placeholder="담당자 이름" className="w-full border p-2 mb-2"
          value={managerName} onChange={(e) => setManagerName(e.target.value)} />

        <input placeholder="담당자 전화번호" className="w-full border p-2 mb-2"
          value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} />

        <input placeholder="성별" className="w-full border p-2 mb-2"
          value={gender} onChange={(e) => setGender(e.target.value)} />

        <input type="date" className="w-full border p-2 mb-2"
          value={lastContact} onChange={(e) => setLastContact(e.target.value)} />

        <input placeholder="메모" className="w-full border p-2 mb-2"
          value={memo} onChange={(e) => setMemo(e.target.value)} />

        <select className="w-full border p-2 mb-2"
          value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
          <option value={1}>★</option>
          <option value={2}>★★</option>
          <option value={3}>★★★</option>
        </select>

        <button onClick={addContact}
          className="w-full bg-blue-500 text-white p-2 rounded">
          추가
        </button>
      </div>

      {/* 검색 */}
      <input
        type="text"
        placeholder="이름 / 업체 검색"
        className="w-full border p-2 mb-4 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 목록 */}
      {filtered.map((c) => (
        <div key={c.id} className="border p-3 rounded mb-2">

          <div className="font-semibold">
            {c.manager_name} ({c.gongjong})
          </div>

          <div className="text-sm text-gray-500">
            {c.company}
          </div>

          <div className="text-sm">
            {c.manager_phone}
          </div>

          <div className="text-xs text-gray-400">
            {c.memo}
          </div>

        </div>
      ))}

    </div>
  )
}