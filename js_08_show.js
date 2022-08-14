var PAIR = PAIR;
var STAT = STAT;
var RULE = RULE;
var AI = AI;
var DRAW = DRAW;
var AREA = AREA;
var PRESS = PRESS;
var window = window;

//показ игровой ситуации (примитивы)
var SHOW = {
    //отрисовка одного хода (компьютера) или всех доступных ходов
    MOVE: {
        //показывай 1 ход
        f_one_move: function (get_who, m) {
            'use strict';
            //область для тримино
            var area_trimino = PAIR.CUT.f_same(
                AREA.GET_CELL.f_cell(m.n_x, m.n_y),
                AREA.CUT.FIG_FREE.area
            );

            //рисуй само тримино в области
            DRAW.PAINT.f_trimino_area(
                area_trimino,
                AREA.CUT.FIG_FREE.r_0_to_1,
                m.n_fig,
                DRAW.CTX.ARR.moves[get_who]
            );
        },

        //покажи доступные ходы
        f_free_moves_by_game: function (get_game) {
            'use strict';
            var n = get_game.move_number,
                get_board = get_game.ARR[n].board,
                get_fig = get_game.ARR[n].fig,
                get_who = RULE.WHO.f_who_by_n(n),
                
                legal_cells = RULE.BOARD.f_legal_cells(get_board, get_fig, get_who),
                ix,
                iy;

            //пройдись по всем строкам и столбцам
            for (ix = 0; ix < STAT.C.N; ix += 1) {
                for (iy = 0; iy < STAT.C.N; iy += 1) {
                    //ход на эту ячейку возможен
                    if (RULE.CELL.f_get(legal_cells, ix, iy)) {
                        SHOW.MOVE.f_one_move(get_who, RULE.MOVE.f_create(ix, iy, get_fig));
                    }
                }
            }
        }
    },

    //перерисовка клеток и всей доски по матрице сжатий
    CELL: {
        //покажи пустую ячейку
        f_empty: function (ix, iy) {
            'use strict';
            DRAW.PAINT.f_rect(AREA.GET_CELL.f_cell(ix, iy), DRAW.CTX.BOARD.cells);
        },

        //покажи одну сжатую шашку на доске (она точно есть)
        f_not_empty: function (x, y, press_xy) {
            'use strict';
            var ball_area = AREA.GET_CELL.f_ball(x, y),
                sets_arr_2 = DRAW.CTX.BOARD.ball;
            //шашка - это эллипс
            DRAW.PAINT.f_ellipse_area(
                //эллипс в удаляемых рядах надо сжать
                PAIR.CUT.f_cut_part_wh(ball_area, press_xy),
                sets_arr_2
            );
        },

        //перерисуй одну ячейку
        f_redraw: function (x, y, cell_value, press_xy) {
            'use strict';
            SHOW.CELL.f_empty(x, y);
            if (cell_value) {
                SHOW.CELL.f_not_empty(x, y, press_xy);
            }
        },

        //покажи всё поле по матрице значений сжатия (по умолчанию везде (1,1))
        f_grid_by_matrix: function (board, optional_press_matrix) {
            'use strict';
            var ix, iy;

            if (optional_press_matrix === undefined) {
                optional_press_matrix = PRESS.f_xy_11();
            }
            
            //показывай все шашки на доске
            for (ix = 0; ix < STAT.C.N; ix += 1) {
                for (iy = 0; iy < STAT.C.N; iy += 1) {
                    SHOW.CELL.f_redraw(
                        ix,
                        iy,
                        RULE.CELL.f_get(board, ix, iy),
                        RULE.CELL.f_get(optional_press_matrix, ix, iy)
                    );
                }
            }
        }
    },
    
    //тримино на панели и всё, кроме доски
    PANEL: {
        //покажи новое тримино
        f_new_trimino: function (get_fig, who) {
            'use strict';
            var zone = AREA.GRID.new_fig,
                r_0_1 = AREA.CUT.FIG_NEW.r_0_to_1,
                sets_arr_2 = DRAW.CTX.ARR.new_fig[who];
            //на столько обрезаем зону для тримино
            zone = PAIR.CUT.f_same(zone, AREA.CUT.FIG_NEW.area);
            //рисуем тримино с такой обрезкой радиусов
            DRAW.PAINT.f_trimino_area(zone, r_0_1, get_fig, sets_arr_2);
        },

        //покажи элементы управления без тримино
        f_elements_no_trimino: function (get_game_mode, store_012) {
            'use strict';
            var ctx_panel = DRAW.CTX.PANEL.grid,
                arr_text_modes = STAT.TEXTS.str_arr_game_mode;

            //рисуй текст с прямоугольником, по умолчанию цвет панели
            function f_out(area, get_text, ctx_default) {
                ctx_default = ((ctx_default === undefined) ? ctx_panel : ctx_default);
                DRAW.PAINT.f_rect(area, ctx_default);
                DRAW.PAINT.f_text(area, get_text);
            }

            //закрась прямоугольник со всеми режимами игры
            DRAW.PAINT.f_rect(AREA.GRID.game_mode, ctx_panel);
            //выдели выбранный режим игры
            DRAW.PAINT.f_text_arr(
                AREA.GRID.game_mode,
                arr_text_modes,
                get_game_mode,
                DRAW.CTX.PANEL.selected_game_mode
            );

            f_out(AREA.GRID.copm_go, STAT.TEXTS.str_comp_go);
            f_out(AREA.GRID.move_back, STAT.TEXTS.str_move_back);
            f_out(AREA.GRID.move_forward, STAT.TEXTS.str_move_forward);
            f_out(AREA.GRID.new_fig, STAT.TEXTS.str_new_fig);
            f_out(AREA.GRID.new_game, STAT.TEXTS.str_new_game);

            if (get_game_mode === 0) { //режим пасьянса: покажи номер хода
                f_out(AREA.GRID.score_all, store_012[0]); //контекст по умолчанию
            } else { //во время дуэли показывай счёт
                f_out(AREA.GRID.score_1, store_012[1], DRAW.CTX.ARR.score[1]);
                f_out(AREA.GRID.score_2, store_012[2], DRAW.CTX.ARR.score[2]);
            }
        },

        //покажи элементы управления с новым тримино
        f_elements_with_new_trimino: function (GAME) {
            'use strict';

            //счёт ходов и счёт каждого игрока для вывода номера хода и счёта
            function f_score_text_arr(GAME) {
                var move_text = STAT.TEXTS.str_score_move + (GAME.move_number + 1),
                    //запасы обоих игроков, счёт с начального запаса (константа)
                    i_store_arr = [STAT.C.STORE, STAT.C.STORE],
                    i_delta,
                    i_board,
                    i;
                //как в течение партии менялся запас игроков
                for (i = 0; i < GAME.move_number; i += 1) {
                    i_board = GAME.ARR[i + 1].board; //следующая позиция
                    i_delta = RULE.BOARD.f_empty_amount(i_board); //пустых клеток
                    i_store_arr[i % 2] += i_delta; //прибавь пустые (выгодно есть)

                    i_board = GAME.ARR[i].board; //текущая позиция
                    i_delta = RULE.BOARD.f_empty_amount(i_board); //пустых клеток
                    i_store_arr[i % 2] -= i_delta; //вычти, сколько было пустых 
                }

                return [move_text, i_store_arr[0], i_store_arr[1]];
            }

            SHOW.PANEL.f_elements_no_trimino(
                GAME.mode,
                f_score_text_arr(GAME)
            );
            SHOW.PANEL.f_new_trimino(
                GAME.ARR[GAME.move_number].fig,
                RULE.WHO.f_who_by_n(GAME.move_number)
            );
        },

        //измени размеры доски без перерисовки доски (с перерисовкой панелей)
        f_window_resize: function (GAME) {
            'use strict';
            //растягиваем канву по всей форме
            DRAW.F.f_canvas_maximize();
            //устанавливаем в соответствии с размерами канвы срезы и ибласти
            AREA.SET.f_cut_and_grid(DRAW.F.f_wh());
            //устанавливаем начальные контексты рисования
            DRAW.F.f_ctx_set_firstly();

            SHOW.PANEL.f_elements_with_new_trimino(GAME);
        }
    }
};
