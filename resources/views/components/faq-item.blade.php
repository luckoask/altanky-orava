@props(['question', 'answer', 'index'])
<details class="faq-item" name="faq">
    <summary><span class="faq-number" aria-hidden="true">{{ str_pad($index + 1, 2, '0', STR_PAD_LEFT) }}</span><span>{{ $question }}</span><x-icon name="plus" /></summary>
    <div class="faq-answer"><p>{{ $answer }}</p></div>
</details>
