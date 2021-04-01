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
        let ct_lines = ciphertext.trim().split('\n');
        this.count_frequencies(ct_lines);
        // display sorted list of characters
        this.show_mapping();
        // apply character mapping, if present
        let pt_lines = this.apply_mapping(ct_lines);
        // display plaintext
        this.show_plaintext(pt_lines);
    },

    count_frequencies: function(lines) {
        this.freq_count.clear();
        this.freq_count.total_chars = 0;
        for(const line of lines) {
            for(let chr of line) {
                if(this.case_insensitive) {
                    chr = chr.toUpperCase();
                }
                if( this.alpha_only && (/[^A-Z]/i.test(chr)) ) {
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
            pt_glyph.onfocus = ( (e) => e.target.select() );
            pt_glyph.oninput = ( () => {
                pt_glyph.value = pt_glyph.value.substr(0,1);
                this.mapping.set(chr, pt_glyph.value);
                this.handle_ciphertext();
            } );

            map_panel.appendChild(ct_glyph);
            map_panel.appendChild(frequency);
            map_panel.appendChild(pt_glyph);
        }
        let old_map_panel = document.querySelector('#cg_map > .cg_map_grid');
        old_map_panel.replaceWith(map_panel);
    },

    apply_mapping: function(ct_lines) {
        let pt_lines = [];
        for(const ct_line of ct_lines) {
            let pt_line = "";
            for(const chr of ct_line) {
                let normalized_chr = chr;
                if(this.case_insensitive) {
                    normalized_chr = chr.toUpperCase();
                }
                if(this.alpha_only) {
                    /* If this.mapping has a leftover mapping for a
                       non-alphabetic character, we need to ignore that. */
                    if( /[^A-Z]/i.test(chr) ) {
                        pt_line += chr;
                        continue;
                    }
                }

                let pt_chr = this.mapping.get(normalized_chr) || chr;
                if(this.case_insensitive) {
                    if( /[a-z]/.test(chr) ) {
                        pt_chr = pt_chr.toLowerCase();
                    }
                    if( /[A-Z]/.test(chr) ) {
                        pt_chr = pt_chr.toUpperCase();
                    }
                }
                pt_line += pt_chr;
            }
            pt_lines.push(pt_line);
        }
        return pt_lines;
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

    reset_key: function() {
        this.mapping.clear();
        this.handle_ciphertext();
    },

    rot13: function() {
        this.mapping.clear();
        let a = 'a'.charCodeAt(0);
        for(let offset = 0; offset < 26; offset++) {
            let code = (offset + 13) % 26;
            let old_chr = String.fromCharCode(a + offset);
            let new_chr = String.fromCharCode(a + code);
            this.mapping.set(old_chr, new_chr);
            this.mapping.set(old_chr.toUpperCase(), new_chr.toUpperCase());
        }
        this.handle_ciphertext();
    },

}
