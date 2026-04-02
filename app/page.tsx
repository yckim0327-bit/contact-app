'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

type Contact = {
  id: string
  gongjong: string
  company: string
  companyPhone: string
  managerName: string
  managerPhone: string
  gender: string
  memo: string
  priority: number
  last_contact: string
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [search, setSearch] = useState('')

  const [gongjong, setGongjong] = useState('')
  const [company, setCompany] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [gender, setGender] = useState('')
  const [memo, setMemo] = useState('')
  const [priority, setPriority] = useState(1)

  const [editingId, setEditingId] = useState<string | null>(null)

  const [selectedGongjong, setSelectedGongjong] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')

  // 데이터 불러오기
  const fetchData = async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')

    if (data) setContacts(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 추가 / 수정
  const handleSubmit = async () => {
    if (!managerName || !managerPhone) {
      alert('이름 / 전화번호 필수')
      return
    }

    const payload = {
      gongjong,
      company,
      companyPhone,
      managerName,
      managerPhone,
      gender,
      memo,
      priority,
      last_contact: new Date().toISOString(),
    }

    if (editingId) {
      await supabase.from('contacts').update(payload).eq('id', editingId)
    } else {
      await supabase.from('contacts').insert([payload])
    }

    resetForm()
    fetchData()
  }

  // 수정 버튼 클릭
  const handleEdit = (c: Contact) => {
    setGongjong(c.gongjong)
    setCompany(c.company)
    setCompanyPhone(c.companyPhone)
    setManagerName(c.managerName)
    setManagerPhone(c.managerPhone)
    setGender(c.gender)
    setMemo(c.memo)
    setPriority(c.priority)
    setEditingId(c.id)
  }

  // 삭제
  const handleDelete = async (id: string) => {
    await supabase.from('contacts').delete().eq('id', id)
    fetchData()
  }

  // 전화 → 최근연락 업데이트
  const handleCall = async (c: Contact) => {
    window.location.href = `tel:${c.managerPhone}`

    await supabase
      .from('contacts')
      .update({ last_contact: new Date().toISOString() })
      .eq('id', c.id)

    fetchData()
  }

  // 폼 초기화
  const resetForm = () => {
    setGongjong('')
    setCompany('')
    setCompanyPhone('')
    setManagerName('')
    setManagerPhone('')
    setGender('')
    setMemo('')
    setPriority(1)
    setEditingId(null)
  }

  // 필터 + 검색
  const filtered = contacts.filter(c => {
    const matchSearch =
      c.managerName.includes(search) ||
      c.company.includes(search)

    const matchGongjong =
      !selectedGongjong || c.gongjong === selectedGongjong

    const matchCompany =
      !selectedCompany || c.company === selectedCompany

    return matchSearch && matchGongjong && matchCompany
  })

  // ⭐ VIP 정렬 (핵심)
  const sorted = [...filtered].sort((a, b) => {
    if (b.priority !== a.priority) {
      return b.priority - a.priority
    }
    return new Date(b.last_contact).getTime() - new Date(a.last_contact).getTime()
  })

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">현장 연락처</h1>

      {/* 입력 */}
      <div className="border p-3 mb-3 space-y-2">
        <input placeholder="공종" value={gongjong} onChange={e => setGongjong(e.target.value)} className="w-full border p-2"/>
        <input placeholder="업체명" value={company} onChange={e => setCompany(e.target.value)} className="w-full border p-2"/>
        <input placeholder="본사번호" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} className="w-full border p-2"/>
        <input placeholder="담당자 이름" value={managerName} onChange={e => setManagerName(e.target.value)} className="w-full border p-2"/>
        <input placeholder="담당자 전화번호" value={managerPhone} onChange={e => setManagerPhone(e.target.value)} className="w-full border p-2"/>
        <input placeholder="성별" value={gender} onChange={e => setGender(e.target.value)} className="w-full border p-2"/>
        <input placeholder="메모" value={memo} onChange={e => setMemo(e.target.value)} className="w-full border p-2"/>

        <select value={priority} onChange={e => setPriority(Number(e.target.value))} className="w-full border p-2">
          <option value={1}>★</option>
          <option value={2}>★★</option>
          <option value={3}>★★★</option>
        </select>

        <button onClick={handleSubmit} className="w-full bg-blue-500 text-white p-2">
          {editingId ? '수정 완료' : '추가'}
        </button>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 mb-2">
        <select value={selectedGongjong} onChange={e => setSelectedGongjong(e.target.value)} className="border p-2 flex-1">
          <option value="">전체 공종</option>
          {[...new Set(contacts.map(c => c.gongjong))].map((g, i) => (
            <option key={i}>{g}</option>
          ))}
        </select>

        <select value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)} className="border p-2 flex-1">
          <option value="">전체 업체</option>
          {[...new Set(contacts.map(c => c.company))].map((c, i) => (
            <option key={i}>{c}</option>
          ))}
        </select>
      </div>

      {/* 검색 */}
      <input
        placeholder="이름 / 업체 검색"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border p-2 mb-3"
      />

      {/* 리스트 */}
      {sorted.map(c => (
        <div key={c.id} className="border p-3 mb-2 rounded">
          <div className="font-bold">
            {c.managerName} ({c.gender}) {'★'.repeat(c.priority)}
          </div>
          <div>{c.company} / {c.gongjong}</div>
          <div>본사: {c.companyPhone}</div>
          <div>담당자: {c.managerPhone}</div>
          <div className="text-xs text-gray-500">
            최근 연락: {new Date(c.last_contact).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-400">메모: {c.memo}</div>

          <div className="flex gap-2 mt-2 text-sm">
            <button onClick={() => handleCall(c)} className="text-blue-500">전화</button>
            <button onClick={() => handleEdit(c)} className="text-green-500">수정</button>
            <button onClick={() => handleDelete(c.id)} className="text-red-500">삭제</button>
          </div>
        </div>
      ))}
    </div>
  )
}