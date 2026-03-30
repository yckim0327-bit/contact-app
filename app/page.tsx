'use client'

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function Home() {
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState<any[]>([])

  // 입력값 상태
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')

  // 데이터 불러오기
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')

    if (!error) setContacts(data || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 추가 기능
  const addContact = async () => {
    if (!name) return alert('이름 입력해라')

    const { error } = await supabase
      .from('contacts')
      .insert([
        {
          name: name,
          company: company,
          head_office_phone: phone,
        },
      ])

    if (error) {
      alert('추가 실패')
      console.error(error)
    } else {
      alert('추가 완료')

      // 입력값 초기화
      setName('')
      setCompany('')
      setPhone('')

      // 다시 불러오기
      fetchData()
    }
  }

  // 검색 필터
  const filtered = contacts.filter((c) =>
    (c.name || '').includes(search) ||
    (c.company || '').includes(search)
  )

  return (
    <div className="p-4 max-w-md mx-auto">

      <h1 className="text-xl font-bold mb-4">현장 연락처</h1>

      {/* 추가 입력 */}
      <div className="mb-4 border p-3 rounded">
        <input
          placeholder="이름"
          className="w-full border p-2 mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="업체"
          className="w-full border p-2 mb-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="전화번호"
          className="w-full border p-2 mb-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button
          onClick={addContact}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
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
          <div className="font-semibold">{c.name}</div>
          <div className="text-sm text-gray-500">{c.company}</div>
          <a
            href={`tel:${c.head_office_phone}`}
            className="text-blue-500"
          >
            전화
          </a>
        </div>
      ))}

    </div>
  )
}