cg = {

    // options
    alpha_only: true,
    case_insensitive: true,

    freq_count: new Map(),
    mapping: new Map(),

    handle_ciphertext: function() {
        // process for character frequency
        let ciphertext =
            document.querySelector('#cg_ciphertext > textarea').value;
        let lines = ciphertext.trim().split('\n');
        this.count_frequencies(lines);
        // display sorted list of characters
        this.show_mapping();
        // apply character mapping, if present
        // display plaintext
        this.show_plaintext(lines);
    },

    count_frequencies: function(lines) {
        this.freq_count.clear();
        this.freq_count.total_chars = 0;
        for(const line of lines) {
            for(let chr of line) {
                if(this.case_insensitive) {
                    chr = chr.toUpperCase();
                }
                if( this.alpha_only && !(/[A-Z]/i.test(chr)) ) {
                    continue;
                }
                let count = this.freq_count.get(chr) || 0;
                this.freq_count.set(chr, count + 1);
                this.freq_count.total_chars += 1;
            }
        }
    },

    show_mapping: function() {
        let chars = Array.from(this.freq_count.keys());
        chars.sort( (a,b) => this.freq_count.get(b) - this.freq_count.get(a) );

        let map_panel = document.createElement('span');
        map_panel.setAttribute('class', 'cg_map_grid');
        for(const chr of chars) {
            let ct_glyph = document.createElement('span');
            ct_glyph.appendChild( document.createTextNode(chr) );

            let frequency = document.createElement('span');
            let percentage =
                this.freq_count.get(chr) / this.freq_count.total_chars;
            percentage = (percentage * 100).toFixed(2);
            frequency.appendChild( document.createTextNode(percentage) );

            let pt_glyph = document.createElement('input');
            if( this.mapping.has(chr) ) {
                pt_glyph.value = this.mapping.get(chr);
            }

            map_panel.appendChild(ct_glyph);
            map_panel.appendChild(frequency);
            map_panel.appendChild(pt_glyph);
        }
        let old_map_panel = document.querySelector('#cg_map > .cg_map_grid');
        old_map_panel.replaceWith(map_panel);
    },

    apply_mapping: function() {
    },

    show_plaintext: function(lines) {
        let span = document.createElement('span');
        let para = document.createElement('p');
        let add_line_break = false;
        for(const line of lines) {
            // treat double newline as paragraph break
            if( line.length == 0 ) {
                span.appendChild(para);
                para = document.createElement('p');
                add_line_break = false;
                continue;
            }

            if( add_line_break ) {
                para.appendChild( document.createElement('br') );
            }
            para.appendChild( document.createTextNode(line) );
            add_line_break = true;
        }
        // that loop doesn't add the last paragraph
        span.appendChild(para);

        document.querySelector('#cg_plaintext > span').replaceWith(span);
    },

    toggle_alpha_only: function() {
        let alpha_only_checkbox =
            document.getElementById('cg_alpha_only');
        this.alpha_only = alpha_only_checkbox.checked;
        this.handle_ciphertext();
    },

    toggle_case_insensitive: function() {
        let case_insensitive_checkbox =
            document.getElementById('cg_case_insensitive');
        this.case_insensitive = case_insensitive_checkbox.checked;
        this.handle_ciphertext();
    },

}
