'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

type Contact = {
  id: string
  gongjong: string | null
  company: string | null
  company_phone: string | null
  manager_name: string | null
  manager_phone: string | null
  gender: string | null
  last_contact: string | null
  memo: string | null
  priority: number | null
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])

  const [selectedGongjong, setSelectedGongjong] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')

  const [gongjong, setGongjong] = useState('')
  const [company, setCompany] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [gender, setGender] = useState('')
  const [memo, setMemo] = useState('')
  const [priority, setPriority] = useState(1)

  const fetchData = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('priority', { ascending: false })
      .order('last_contact', { ascending: false })

    setContacts((data as Contact[]) || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addContact = async () => {
    await supabase.from('contacts').insert([
      {
        gongjong,
        company,
        company_phone: companyPhone,
        manager_name: managerName,
        manager_phone: managerPhone,
        gender,
        memo,
        priority,
        last_contact: new Date().toISOString(),
      },
    ])
    fetchData()
  }

  const deleteContact = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id)
    fetchData()
  }

  const markLastContactNow = async (id: string) => {
    await supabase
      .from('contacts')
      .update({ last_contact: new Date().toISOString() })
      .eq('id', id)

    fetchData()
  }

  const updatePriority = async (id: string, next: number) => {
    await supabase
      .from('contacts')
      .update({ priority: next })
      .eq('id', id)

    fetchData()
  }

  const filtered = contacts.filter((c) => {
    const keyword = search.trim()

    const matchSearch =
      !keyword ||
      (c.manager_name || '').includes(keyword) ||
      (c.company || '').includes(keyword) ||
      (c.gongjong || '').includes(keyword) ||
      (c.manager_phone || '').includes(keyword)

    const matchGongjong =
      !selectedGongjong || c.gongjong === selectedGongjong

    const matchCompany =
      !selectedCompany || c.company === selectedCompany

    return matchSearch && matchGongjong && matchCompany
  })

  const formatDate = (d: string | null) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('ko-KR')
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">현장 연락처</h1>

      {/* 입력폼 */}
      <div className="border p-3 rounded mb-4">
        <input placeholder="공종" className="w-full border p-2 mb-2" value={gongjong} onChange={(e) => setGongjong(e.target.value)} />
        <input placeholder="업체명" className="w-full border p-2 mb-2" value={company} onChange={(e) => setCompany(e.target.value)} />
        <input placeholder="본사번호" className="w-full border p-2 mb-2" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
        <input placeholder="담당자 이름" className="w-full border p-2 mb-2" value={managerName} onChange={(e) => setManagerName(e.target.value)} />
        <input placeholder="담당자 전화번호" className="w-full border p-2 mb-2" value={managerPhone} onChange={(e) => setManagerPhone(e.target.value)} />
        <input placeholder="성별" className="w-full border p-2 mb-2" value={gender} onChange={(e) => setGender(e.target.value)} />
        <input placeholder="메모" className="w-full border p-2 mb-2" value={memo} onChange={(e) => setMemo(e.target.value)} />

        <select className="w-full border p-2 mb-2" value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
          <option value={1}>★</option>
          <option value={2}>★★</option>
          <option value={3}>★★★</option>
        </select>

        <button onClick={addContact} className="w-full bg-blue-500 text-white p-2 rounded">
          추가
        </button>
      </div>

      {/* 🔥 필터 (여기가 핵심 위치) */}
      <div className="flex gap-2 mb-3">
        <select value={selectedGongjong} onChange={(e) => setSelectedGongjong(e.target.value)} className="border p-2 flex-1">
          <option value="">전체 공종</option>
          {[...new Set(contacts.map(c => c.gongjong || ''))].map((g, i) =>
            g ? <option key={i} value={g}>{g}</option> : null
          )}
        </select>

        <select value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)} className="border p-2 flex-1">
          <option value="">전체 업체</option>
          {[...new Set(contacts.map(c => c.company || ''))].map((c, i) =>
            c ? <option key={i} value={c}>{c}</option> : null
          )}
        </select>
      </div>

      {/* 검색 */}
      <input
        placeholder="이름 / 업체 검색"
        className="w-full border p-2 mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* 리스트 */}
      {filtered.map((c) => (
        <div key={c.id} className="border p-3 rounded mb-2">
          <div className="flex justify-between">
            <div>{c.manager_name}</div>
            <button onClick={() => updatePriority(c.id, c.priority === 3 ? 1 : (c.priority || 1) + 1)}>
              {'★'.repeat(c.priority || 1)}
            </button>
          </div>

          <div>{c.company} / {c.gongjong}</div>
          <div>본사: {c.company_phone}</div>
          <div>담당자: {c.manager_phone}</div>
          <div className="text-sm text-gray-500">최근: {formatDate(c.last_contact)}</div>

          <div className="flex gap-2 mt-2 text-sm">
            <a href={`tel:${c.manager_phone}`} onClick={() => markLastContactNow(c.id)} className="text-blue-500">전화</a>
            <button onClick={() => markLastContactNow(c.id)} className="text-green-600">연락일</button>
            <button onClick={() => deleteContact(c.id)} className="text-red-500">삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
}