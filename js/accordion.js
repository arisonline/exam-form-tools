const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
      const question = item.querySelector('.accordion-question');
      const answer = item.querySelector('.accordion-answer');
    
      question.addEventListener('click', () => {
        item.classList.toggle('active');
      });
    });
