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

const emptyForm = {
  gongjong: '',
  company: '',
  companyPhone: '',
  managerName: '',
  managerPhone: '',
  gender: '',
  memo: '',
  priority: 1,
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [contacts, setContacts] = useState<Contact[]>([])

  const [gongjong, setGongjong] = useState('')
  const [company, setCompany] = useState('')
  const [companyPhone, setCompanyPhone] = useState('')
  const [managerName, setManagerName] = useState('')
  const [managerPhone, setManagerPhone] = useState('')
  const [gender, setGender] = useState('')
  const [memo, setMemo] = useState('')
  const [priority, setPriority] = useState(1)

  const [editingId, setEditingId] = useState<string | null>(null)

  const resetForm = () => {
    setGongjong(emptyForm.gongjong)
    setCompany(emptyForm.company)
    setCompanyPhone(emptyForm.companyPhone)
    setManagerName(emptyForm.managerName)
    setManagerPhone(emptyForm.managerPhone)
    setGender(emptyForm.gender)
    setMemo(emptyForm.memo)
    setPriority(emptyForm.priority)
    setEditingId(null)
  }

  const fetchData = async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('priority', { ascending: false })
      .order('last_contact', { ascending: false })

    if (error) {
      console.error('불러오기 실패:', error)
      return
    }

    setContacts((data as Contact[]) || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  const addContact = async () => {
    if (!managerName.trim()) {
      alert('담당자 이름을 입력해라')
      return
    }

    const payload = {
      gongjong,
      company,
      company_phone: companyPhone,
      manager_name: managerName,
      manager_phone: managerPhone,
      gender,
      memo,
      priority,
      last_contact: new Date().toISOString(),
    }

    const { error } = await supabase.from('contacts').insert([payload])

    if (error) {
      console.error('추가 실패:', error)
      alert('추가 실패')
      return
    }

    alert('추가 완료')
    resetForm()
    fetchData()
  }

  const startEdit = (c: Contact) => {
    setEditingId(c.id)
    setGongjong(c.gongjong || '')
    setCompany(c.company || '')
    setCompanyPhone(c.company_phone || '')
    setManagerName(c.manager_name || '')
    setManagerPhone(c.manager_phone || '')
    setGender(c.gender || '')
    setMemo(c.memo || '')
    setPriority(c.priority || 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const updateContact = async () => {
    if (!editingId) return
    if (!managerName.trim()) {
      alert('담당자 이름을 입력해라')
      return
    }

    const { error } = await supabase
      .from('contacts')
      .update({
        gongjong,
        company,
        company_phone: companyPhone,
        manager_name: managerName,
        manager_phone: managerPhone,
        gender,
        memo,
        priority,
      })
      .eq('id', editingId)

    if (error) {
      console.error('수정 실패:', error)
      alert('수정 실패')
      return
    }

    alert('수정 완료')
    resetForm()
    fetchData()
  }

  const deleteContact = async (id: string) => {
    const ok = confirm('이 연락처를 삭제할까?')
    if (!ok) return

    const { error } = await supabase.from('contacts').delete().eq('id', id)

    if (error) {
      console.error('삭제 실패:', error)
      alert('삭제 실패')
      return
    }

    alert('삭제 완료')
    if (editingId === id) resetForm()
    fetchData()
  }

  const updatePriority = async (id: string, nextPriority: number) => {
    const { error } = await supabase
      .from('contacts')
      .update({ priority: nextPriority })
      .eq('id', id)

    if (error) {
      console.error('중요도 변경 실패:', error)
      alert('중요도 변경 실패')
      return
    }

    fetchData()
  }

  const markLastContactNow = async (id: string) => {
    const { error } = await supabase
      .from('contacts')
      .update({ last_contact: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('최근 연락일 갱신 실패:', error)
      return
    }

    fetchData()
  }

  const filtered = contacts.filter((c) => {
    const keyword = search.trim()
    if (!keyword) return true

    return (
      (c.manager_name || '').includes(keyword) ||
      (c.company || '').includes(keyword) ||
      (c.gongjong || '').includes(keyword) ||
      (c.manager_phone || '').includes(keyword)
    )
  })

  const renderStars = (value: number | null | undefined) => {
    const count = value || 1
    return '★'.repeat(count)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleDateString('ko-KR')
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">현장 연락처</h1>

      <div className="mb-4 border p-3 rounded">
        <input
          placeholder="공종"
          className="w-full border p-2 mb-2"
          value={gongjong}
          onChange={(e) => setGongjong(e.target.value)}
        />
        <input
          placeholder="업체명"
          className="w-full border p-2 mb-2"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <input
          placeholder="본사번호"
          className="w-full border p-2 mb-2"
          value={companyPhone}
          onChange={(e) => setCompanyPhone(e.target.value)}
        />
        <input
          placeholder="담당자 이름"
          className="w-full border p-2 mb-2"
          value={managerName}
          onChange={(e) => setManagerName(e.target.value)}
        />
        <input
          placeholder="담당자 전화번호"
          className="w-full border p-2 mb-2"
          value={managerPhone}
          onChange={(e) => setManagerPhone(e.target.value)}
        />
        <input
          placeholder="성별"
          className="w-full border p-2 mb-2"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
        />
        <input
          placeholder="메모"
          className="w-full border p-2 mb-2"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
        />

        <select
          className="w-full border p-2 mb-2"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        >
          <option value={1}>중요도 ★</option>
          <option value={2}>중요도 ★★</option>
          <option value={3}>중요도 ★★★</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={editingId ? updateContact : addContact}
            className="flex-1 bg-blue-500 text-white p-2 rounded"
          >
            {editingId ? '수정 완료' : '추가'}
          </button>

          {editingId && (
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-500 text-white p-2 rounded"
            >
              취소
            </button>
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="이름 / 업체 검색"
        className="w-full border p-2 mb-4 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.map((c) => (
        <div key={c.id} className="border p-3 rounded mb-2">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold">
              {c.manager_name} {c.gender ? `(${c.gender})` : ''}
            </div>
            <button
              onClick={() =>
                updatePriority(c.id, c.priority === 3 ? 1 : (c.priority || 1) + 1)
              }
              className="text-yellow-500 text-sm"
            >
              {renderStars(c.priority)}
            </button>
          </div>

          <div className="text-sm text-gray-600">
            {c.company} / {c.gongjong}
          </div>

          <div className="text-sm mt-1">본사: {c.company_phone || '-'}</div>
          <div className="text-sm">담당자: {c.manager_phone || '-'}</div>
          <div className="text-xs text-gray-500 mt-1">
            최근 연락일: {formatDate(c.last_contact)}
          </div>

          {c.memo && (
            <div className="text-xs text-gray-400 mt-1">
              메모: {c.memo}
            </div>
          )}

          <div className="flex gap-3 mt-3 text-sm">
            <a
              href={`tel:${c.manager_phone || ''}`}
              onClick={() => markLastContactNow(c.id)}
              className="text-blue-500"
            >
              전화
            </a>

            <button
              onClick={() => markLastContactNow(c.id)}
              className="text-green-600"
            >
              연락일 갱신
            </button>

            <button
              onClick={() => startEdit(c)}
              className="text-orange-500"
            >
              수정
            </button>

            <button
              onClick={() => deleteContact(c.id)}
              className="text-red-500"
            >
              삭제
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}