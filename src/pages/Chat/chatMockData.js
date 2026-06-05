export const fallbackHome = {
  elder: {
    elder_id: 1,
    name: '박어르신',
    age: 78,
    gender: 'F',
    cognitive_note: '최근 식사 내용을 자주 확인하면 좋아요',
    onboarding_completed: false,
  },
  guardian: {
    guardian_id: 1,
    name: '김보호',
  },
  schedules: [
    {
      schedule_id: 1,
      scheduled_time: '10:00:00',
      repeat_type: '매일',
      is_active: 1,
      scenario_id: 1,
      scenario_title: '오늘 기분 묻기',
      scenario_category: '일상',
    },
  ],
  latest_call: null,
}

export const starterQuestions = [
  '안녕하세요. 오늘 아침은 어떻게 보내셨어요?',
  '오늘 기억나는 일 중에서 가장 좋았던 순간을 말씀해 주세요.',
  '요즘 자주 생각나는 사람이나 장소가 있으세요?',
  '오늘 기분을 한 문장으로 표현한다면 어떻게 말할 수 있을까요?',
]

export const calmReplies = [
  '말씀해 주셔서 고마워요. 조금 더 천천히 이어서 들려주세요.',
  '좋은 이야기네요. 그때 어떤 기분이 드셨는지도 궁금해요.',
  '잘 들었어요. 기억나는 장면을 하나만 더 말씀해 주실 수 있을까요?',
  '괜찮습니다. 편한 속도로 말씀해 주시면 제가 듣고 있을게요.',
]
